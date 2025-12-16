import { useState, useEffect, useCallback, useRef } from "react";
import classes from "./fmRadio.module.css";
import { fetchRequest } from "../../utils";
import { TbAntennaBars5, TbPlayerTrackNext, TbVolume } from "react-icons/tb";
import {
  FaPowerOff,
  FaVolumeUp,
  FaVolumeDown,
  FaSave,
  FaTrashAlt,
} from "react-icons/fa";
import { FiRefreshCw, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { useI18nContext } from "../../contexts/i18nContext";

// Định nghĩa các endpoints và METHOD chính xác
const API_ENDPOINTS = {
  // GET
  STATUS: "/fm/status",
  LOAD_CHANNELS: "/fm/channels",
  SEEK: "/fm/seek", // Dò kênh tự động (next)

  // POST (Hành động thay đổi trạng thái chính)
  POWER: "/fm/power",
  SET_FREQ: "/fm/setfreq", // <--- POST
  SAVE_CHANNEL: "/fm/save",
  SELECT_CHANNEL: "/fm/select",
  VOLUME: "/fm/volume",

  // DELETE (Xóa tài nguyên)
  DELETE_CHANNEL: "/fm/delete",
};

export default function FmRadio() {
  const t = useI18nContext();
  const [status, setStatus] = useState({
    freq: 99.5,
    volume: 10,
    isPowered: false,
    rssi: 0,
    stereo: false,
  });
  const [savedChannels, setSavedChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const multiClickCountRef = useRef(0);
  const multiClickTimerRef = useRef(null);

  const showMessage = useCallback((msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const handleError = useCallback(
    (err, defaultMsg) => {
      setError(err.message || defaultMsg);
      showMessage(null);
      console.error(err);
    },
    [showMessage]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // METHOD: GET
      const statusData = await fetchRequest({
        src: API_ENDPOINTS.STATUS,
        method: "GET",
      });
      setStatus({
        freq: statusData.freq || 0.0,
        volume: statusData.volume || 0,
        isPowered: statusData.isPowered || false,
        rssi: statusData.rssi || 0,
        stereo: statusData.stereo || false,
      });

      // METHOD: GET
      const doc = await fetchRequest({
        src: API_ENDPOINTS.LOAD_CHANNELS,
        method: "GET",
      });
      if (Array.isArray(doc?.channels)) {
        setSavedChannels(doc.channels);
      }
    } catch (err) {
      handleError(err, "Không thể kết nối đến thiết bị.");
      setStatus((prev) => ({ ...prev, isPowered: false }));
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =========================================================
  // CÁC HÀM XỬ LÝ (Action Handlers)
  // =========================================================

  // 1. Bật/Tắt Nguồn -> POST
  const handlePowerToggle = useCallback(async () => {
    setLoading(true);
    setError(null);
    const newState = !status.isPowered ? "on" : "off";
    try {
      // Cập nhật Method thành POST
      await fetchRequest({
        src: `${API_ENDPOINTS.POWER}?state=${newState}`,
        method: "POST",
      });
      await fetchData();
      showMessage(`Đài đã được ${newState === "on" ? "BẬT" : "TẮT"}.`);
    } catch (err) {
      handleError(err, `Lỗi khi ${newState === "on" ? "bật" : "tắt"} đài.`);
    } finally {
      setLoading(false);
    }
  }, [status.isPowered, fetchData, handleError, showMessage]);

  // 2. Tăng/Giảm Âm lượng -> POST
  const handleVolumeChange = useCallback(
    async (delta) => {
      if (!status.isPowered || loading) return;

      let newVolume = status.volume + delta;
      newVolume = Math.min(15, Math.max(0, newVolume));

      try {
        await fetchRequest({
          src: `${API_ENDPOINTS.VOLUME}?level=${newVolume}`,
          method: "POST",
        });
        setStatus((prev) => ({ ...prev, volume: newVolume }));
      } catch (err) {
        handleError(err, "Lỗi khi thay đổi âm lượng.");
      }
    },
    [status.isPowered, status.volume, loading, handleError]
  );

  // 3. Chuyển Tần số Thủ công -> POST (Đã cập nhật theo yêu cầu trước đó)
  const handleSetFrequency = useCallback(
    async (delta) => {
      if (!status.isPowered || loading) return;

      let newFreq = status.freq + delta;
      newFreq = Math.min(108.0, Math.max(87.0, parseFloat(newFreq.toFixed(1))));

      if (newFreq === status.freq) return;

      setLoading(true);
      setError(null);
      try {
        // Cập nhật Method thành POST
        const res = await fetchRequest({
          src: `${API_ENDPOINTS.SET_FREQ}?freq=${newFreq}`,
          method: "POST",
        });
        setStatus((prev) => ({ ...prev, freq: res.freq || prev.freq }));
        showMessage(`Đã chỉnh: ${newFreq.toFixed(1)} MHz.`);
      } catch (err) {
        handleError(err, "Lỗi khi chuyển tần số.");
      } finally {
        setLoading(false);
      }
    },
    [status.isPowered, status.freq, loading, handleError, showMessage]
  );

  const handleMultiClickFreqUp = useCallback(() => {
    if (multiClickTimerRef.current) {
      clearTimeout(multiClickTimerRef.current);
      multiClickCountRef.current++;
    }
    multiClickTimerRef.current = setTimeout(() => {
      handleSetFrequency(
        multiClickCountRef.current > 0 ? multiClickCountRef.current : 0.1
      );
      clearTimeout(multiClickTimerRef.current);
      multiClickTimerRef.current = null;
      multiClickCountRef.current = 0;
    }, 500);
  }, [handleSetFrequency]);

  const handleMultiClickFreqDown = useCallback(() => {
    if (multiClickTimerRef.current) {
      clearTimeout(multiClickTimerRef.current);
      multiClickCountRef.current++;
    }
    multiClickTimerRef.current = setTimeout(() => {
      handleSetFrequency(
        multiClickCountRef.current > 0 ? -multiClickCountRef.current : -0.1
      );
      clearTimeout(multiClickTimerRef.current);
      multiClickTimerRef.current = null;
      multiClickCountRef.current = 0;
    }, 500);
  }, [handleSetFrequency]);

  // 4. Dò kênh Tự động -> POST
  const handleSeek = useCallback(async () => {
    if (!status.isPowered || loading) return;
    setLoading(true);
    setError(null);
    try {
      // Cập nhật Method thành POST
      const res = await fetchRequest({
        src: `${API_ENDPOINTS.SEEK}?direction=next`,
        method: "GET",
      });
      setStatus((prev) => ({ ...prev, freq: res.freq || prev.freq }));
      showMessage("Đã dò kênh tự động.");
    } catch (err) {
      handleError(err, "Lỗi khi dò kênh.");
    } finally {
      setLoading(false);
    }
  }, [status.isPowered, loading, handleError, showMessage]);

  // 5. Lưu Kênh hiện tại -> POST
  const handleSaveChannel = useCallback(async () => {
    if (!status.isPowered || loading) return;
    setLoading(true);
    setError(null);
    try {
      // Cập nhật Method thành POST
      await fetchRequest({ src: API_ENDPOINTS.SAVE_CHANNEL, method: "POST" });
      await fetchData();
      showMessage(`Đã lưu ${status.freq.toFixed(1)} MHz.`);
    } catch (err) {
      handleError(err, "Lỗi khi lưu kênh.");
    } finally {
      setLoading(false);
    }
  }, [
    status.isPowered,
    loading,
    status.freq,
    fetchData,
    handleError,
    showMessage,
  ]);

  // 6. Chọn Kênh đã lưu -> POST
  const handleSelectChannel = useCallback(
    async (index) => {
      if (!status.isPowered || loading) return;
      setLoading(true);
      setError(null);
      try {
        // Cập nhật Method thành POST
        const res = await fetchRequest({
          src: `${API_ENDPOINTS.SELECT_CHANNEL}?index=${index}`,
          method: "POST",
        });
        setStatus((prev) => ({ ...prev, freq: res.freq || prev.freq }));
        showMessage(`Đã chuyển đến kênh đã lưu số ${index + 1}.`);
      } catch (err) {
        handleError(err, "Lỗi khi chọn kênh.");
      } finally {
        setLoading(false);
      }
    },
    [status.isPowered, loading, handleError, showMessage]
  );

  // 7. Xóa Kênh đã lưu -> DELETE
  const handleDeleteChannel = useCallback(
    async (index) => {
      if (loading) return;
      setLoading(true);
      setError(null);
      try {
        // Cập nhật Method thành DELETE
        await fetchRequest({
          src: `${API_ENDPOINTS.DELETE_CHANNEL}?index=${index}`,
          method: "DELETE",
        });
        await fetchData();
        showMessage(`Đã xóa kênh số ${index + 1}.`);
      } catch (err) {
        handleError(err, "Lỗi khi xóa kênh.");
      } finally {
        setLoading(false);
      }
    },
    [loading, fetchData, handleError, showMessage]
  );

  return (
    <div className={classes.fmRadioContainer}>
      <h2>{t({id: "fm.dashboard.title", mask:"Bảng Điều Khiển FM Radio"})}</h2>

      {loading && <div className={classes.loadingOverlay}>{t({id: "fm.loading", mask: "Đang tải..."})}</div>}

      <div className={classes.displayArea}>
        <div className={classes.freqDisplay}>
          {status.isPowered ? (
            <>
              <span className={classes.freqValue}>
                {status.freq.toFixed(1)}
              </span>
              <span className={classes.freqUnit}>MHz</span>
            </>
          ) : (
            <span className={classes.offStatus}>OFF</span>
          )}
        </div>
        <div className={classes.metaInfo}>
          <div className={classes.statusItem}>
            <TbVolume className={classes.icon} /> Vol: {status.volume}
          </div>
          <div className={classes.statusItem}>
            <TbAntennaBars5 className={classes.icon} /> RSSI: {status.rssi}
          </div>
          <div className={classes.statusItem}>
            {status.stereo ? "Stereo" : "Mono"}
          </div>
        </div>
      </div>
      <div className={classes.controlPanel}>
        <div className={`${classes.controlGroup} ${classes.primaryControls}`}>
          <button
            className={classes.powerButton}
            onClick={handlePowerToggle}
            disabled={loading}
            style={{
              backgroundColor: status.isPowered ? "#a3e635" : "#f87171",
            }}
            title={status.isPowered ? "Tắt đài" : "Bật đài"}
          >
            <FaPowerOff className={classes.icon} />
          </button>

          <button
            className={classes.actionButton}
            onClick={handleMultiClickFreqUp}
            disabled={!status.isPowered || loading || status.freq >= 108.0}
            title="Tăng tần số 0.1 MHz"
          >
            <FiArrowUp className={classes.icon} />
          </button>
          <button
            className={classes.actionButton}
            onClick={handleMultiClickFreqDown}
            disabled={!status.isPowered || loading || status.freq <= 87.0}
            title="Giảm tần số 0.1 MHz"
          >
            <FiArrowDown className={classes.icon} />
          </button>

          <button
            className={classes.actionButton}
            onClick={handleSeek}
            disabled={!status.isPowered || loading}
            title="Dò kênh tự động"
          >
            <TbPlayerTrackNext className={classes.icon} /> Dò
          </button>
        </div>

        <div className={classes.controlGroup}>
          <button
            className={classes.actionButton}
            onClick={() => handleVolumeChange(1)}
            disabled={!status.isPowered || loading || status.volume === 15}
            title="Tăng âm lượng"
          >
            <FaVolumeUp className={classes.icon} />
          </button>
          <button
            className={classes.actionButton}
            onClick={() => handleVolumeChange(-1)}
            disabled={!status.isPowered || loading || status.volume === 0}
            title="Giảm âm lượng"
          >
            <FaVolumeDown className={classes.icon} />
          </button>

          <button
            className={classes.actionButton}
            onClick={handleSaveChannel}
            disabled={!status.isPowered || loading}
            title="Lưu tần số hiện tại"
          >
            <FaSave className={classes.icon} /> Lưu
          </button>

          <button
            className={classes.actionButton}
            onClick={fetchData}
            disabled={loading}
            title="Cập nhật trạng thái và danh sách kênh"
          >
            <FiRefreshCw className={classes.icon} />
          </button>
        </div>
      </div>
      {error && <div className={classes.error}>{error}</div>}
      {message && <div className={classes.message}>{message}</div>}
      <div className={classes.savedChannelsArea}>
        <h3>Kênh Đã Lưu ({savedChannels.length})</h3>
        <ul className={classes.channelsList}>
          {savedChannels.length === 0 ? (
            <li className={classes.noChannel}>Chưa có kênh nào được lưu.</li>
          ) : (
            savedChannels.map((channel, index) => (
              <li key={index} className={classes.channelItem}>
                <div className={classes.channelInfo}>
                  <span className={classes.channelIndex}>CH {index + 1}</span>
                  <span className={classes.channelFreq}>
                    {channel.toFixed(1)} MHz
                  </span>
                </div>
                <div className={classes.channelActions}>
                  <button
                    className={`${classes.channelBtn} ${classes.selectBtn}`}
                    onClick={() => handleSelectChannel(index)}
                    disabled={!status.isPowered || loading}
                  >
                    Nghe
                  </button>
                  <button
                    className={`${classes.channelBtn} ${classes.deleteBtn}`}
                    onClick={() => handleDeleteChannel(index)}
                    disabled={loading}
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
