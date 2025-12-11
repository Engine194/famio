import { useCallback, useEffect, useRef, useState } from "react";
import classes from "./explore.module.css";
import { fetchRequest } from "../../utils";
import { useDispatch, useStoreContext } from "../../contexts/storeContext";
import { STORE_ACTION_TYPES } from "../../contexts/actions";
import { useI18nContext } from "../../contexts/i18nContext";

// Constants (adjust if needed)
const POLL_INTERVAL_MS = 2000; // 1s
const SCAN_TIMEOUT_MS = 35000; // 35s

export default function Explore() {
  const t = useI18nContext();
  const [status, setStatus] = useState("idle"); // idle | scanning | complete | error
  const store = useStoreContext();
  const dispatch = useDispatch();
  const networks = store.wifiNetworks;
  const count = networks?.length || 0;
  const [error, setError] = useState(null);
  const [serverMessage, setServerMessage] = useState(null);

  const [selectedSsid, setSelectedSsid] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const firstScanRef = useRef(false);
  const abortRef = useRef(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const passwordRef = useRef(null);

  // Using shared fetchRequest helper from src/utils/api.js

  function clearPolling() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch {
        // ignore
      }
      abortRef.current = null;
    }
  }

  const handleScanJson = useCallback(
    (json) => {
      if (!json) return;
      if (json.status === "complete") {
        const list = Array.isArray(json.networks) ? json.networks.slice() : [];
        list.forEach((n) => {
          if (typeof n.rssi !== "number") n.rssi = Number(n.rssi) || -100;
        });
        list.sort((a, b) => b.rssi - a.rssi);
        dispatch({ type: STORE_ACTION_TYPES.SET_WIFI_NETWORKS, payload: list });
        setStatus("complete");
        clearPolling();
      } else {
        setStatus("scanning");
      }
    },
    [dispatch]
  );

  // starts polling loop; uses same abort controller stored in abortRef
  const startPolling = useCallback(() => {
    if (abortRef.current) {
      // reuse existing controller
    } else {
      abortRef.current = new AbortController();
    }
    const signal = abortRef.current.signal;

    intervalRef.current = setInterval(async () => {
      try {
        const json = await fetchRequest({
          src: "/wifi/scan",
          method: "GET",
          timeout: SCAN_TIMEOUT_MS,
          signal,
        });
        handleScanJson(json);
      } catch (err) {
        if (err.name === "AbortError") return;
        if (
          err.name === "TypeError" &&
          typeof err.message === "string" &&
          err.message.includes("fetch")
        )
          return;
        clearPolling();
        setError(err.message || "Scan failed");
        setStatus("error");
      }
    }, POLL_INTERVAL_MS);

    timeoutRef.current = setTimeout(() => {
      if (abortRef.current) abortRef.current.abort();
      clearPolling();
      setStatus("error");
      setError("Scan timed out. Please try again.");
    }, SCAN_TIMEOUT_MS);
  }, [handleScanJson]);

  // Start scan: call once then poll if needed
  const startScan = useCallback(async () => {
    clearPolling();
    setError(null);
    setServerMessage(null);
    dispatch({ type: STORE_ACTION_TYPES.RESET_WIFI_NETWORKS });
    setSelectedSsid("");
    setPassword("");
    setStatus("scanning");

    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    try {
      const json = await fetchRequest({
        src: "/wifi/scan",
        method: "GET",
        timeout: SCAN_TIMEOUT_MS,
        signal,
      });
      if (json.status === "complete") {
        handleScanJson(json);
        return;
      }
      // start polling for completion
      startPolling();
    } catch (err) {
      if (err.name === "AbortError") return;
      clearPolling();
      setError(err.message || "Failed to start scan");
      setStatus("error");
    }
  }, [dispatch, handleScanJson, startPolling]);

  const selectNetwork = useCallback((ssid) => {
    setSelectedSsid(ssid);
    setServerMessage(null);
    setError(null);
    setPassword("");
    setShowPassword(false);
    // small delay to ensure input available
    setTimeout(() => passwordRef.current && passwordRef.current.focus(), 60);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e && e.preventDefault();
      setServerMessage(null);
      setError(null);
      setSubmitting(true);
      if (!password) {
        setError(t({ id: "password.required", mask: "Password is required" }));
        setSubmitting(false);
        return;
      }
      try {
        const res = await fetchRequest({
          src: "/wifi/config",
          method: "POST",
          payload: { ssid: selectedSsid, pass: password },
          timeout: 15000,
        });
        setServerMessage(res.message || JSON.stringify(res));
        if (res.status === "success") {
          // device will restart
          setServerMessage(res.message || "Device restarting...");
        }
      } catch (err) {
        setError(err.message || "Submit failed");
      } finally {
        setSubmitting(false);
      }
    },
    [t, password, selectedSsid]
  );

  useEffect(() => {
    if (!firstScanRef.current) {
      setTimeout(() => {
        startScan();
      }, [300]);
      firstScanRef.current = true;
    }
  }, [startScan]);

  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, []);

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <h2 className={classes.title}>
          {t({ id: "explore.title", mask: "Explore Wi-Fi" })}
        </h2>
        <p className={classes.subtitle}>
          {t({
            id: "explore.subtitle",
            mask: "Scan for networks and connect your device.",
          })}
        </p>
      </div>

      <div className={classes.controls}>
        <button
          className={classes.btn}
          onClick={startScan}
          disabled={status === "scanning"}
          aria-pressed={status === "scanning"}
        >
          {status === "scanning" ? (
            <>
              <span className={classes.spinner} aria-hidden />{" "}
              {t({ id: "explore.scanning", mask: "Scanning..." })}
            </>
          ) : (
            t({ id: "explore.rescan", mask: "Rescan" })
          )}
        </button>
      </div>

      {status === "error" && (
        <div className={classes.errorLine} role="alert">
          <div>{error}</div>
        </div>
      )}

      {status === "complete" && (
        <section className={classes.results}>
          <div className={classes.resultsHeader}>
            {t({ id: "explore.found", mask: "Found" })} {count}{" "}
            {t({ id: "explore.networks", mask: "networks" })}
          </div>
          <ul className={classes.networks}>
            {networks.map((n, i) => (
              <li
                key={`${n.ssid}-${i}`}
                role="button"
                tabIndex={0}
                className={`${classes.network} ${
                  selectedSsid === n.ssid ? classes.selected : ""
                }`}
                onClick={() => selectNetwork(n.ssid)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    selectNetwork(n.ssid);
                  }
                }}
              >
                <div className={classes.netMain}>
                  <div className={classes.ssid}>{n.ssid || "<hidden>"}</div>
                  <div className={classes.meta}>
                    Ch {n.channel} • RSSI {n.rssi}
                  </div>
                </div>
                <div className={classes.rssiContainer} aria-hidden>
                  <div
                    className={classes.rssiBar}
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, Math.round(((n.rssi + 100) / 70) * 100))
                      )}%`,
                    }}
                  />
                </div>

                {selectedSsid === n.ssid && (
                  <div className={classes.inlineForm}>
                    <form
                      className={classes.formInline}
                      onSubmit={handleSubmit}
                    >
                      <input
                        ref={passwordRef}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder={t({
                          id: "explore.passwordPlaceholder",
                          mask: "Wi-Fi password",
                        })}
                        disabled={submitting}
                        aria-label={t({
                          id: "explore.passwordAria",
                          mask: "Wi-Fi password",
                        })}
                      />
                      {error && (
                        <div className={classes.errorInline}>{error}</div>
                      )}
                      <div className={classes.passwordControls}>
                        <label
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className={classes.checkboxLabel}
                        >
                          <input
                            type="checkbox"
                            checked={showPassword}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            onChange={(e) => setShowPassword(e.target.checked)}
                            title={t({
                              id: "explore.togglePasswordTitle",
                              mask: "Show or hide password",
                            })}
                          />
                          <span>
                            {t({
                              id: "explore.showPassword",
                              mask: "Show password",
                            })}
                          </span>
                        </label>
                      </div>

                      <div className={classes.inlineActions}>
                        <button
                          className={`${classes.btn} ${classes.primary}`}
                          type="submit"
                          disabled={submitting || !selectedSsid}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {submitting
                            ? t({
                                id: "explore.submitting",
                                mask: "Submitting...",
                              })
                            : t({ id: "explore.connect", mask: "Connect" })}
                        </button>
                      </div>
                    </form>
                    {serverMessage && (
                      <div className={classes.serverMsg}>{serverMessage}</div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
