import { env } from "../../env";

export const fetchRequest = async ({ src, method = "GET", payload, timeout = 15000, signal: externalSignal } = {}) => {
  const root = env.NODE_ENV === "development" ? env.ROOT_API_URL : window.location.origin;

  const url = `${root}/api${src}`;

  const headers = {};
  let body;
  if (payload != null && (method === "POST" || method === "PUT" || method === "PATCH")) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(payload);
  }

  // internal controller used to implement timeout and to be able to abort when externalSignal triggers
  const controller = new AbortController();
  const signal = controller.signal;

  // if external signal provided, propagate its abort to our controller so callers can cancel
  let externalListener;
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else {
      externalListener = () => controller.abort();
      externalSignal.addEventListener('abort', externalListener);
    }
  }

  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      signal,
    });

    clearTimeout(timer);
    if (externalSignal && externalListener) externalSignal.removeEventListener('abort', externalListener);

    if (!response.ok) {
      // read text body (if available) for better diagnostics
      let errBody;
      try {
        errBody = await response.text();
      } catch {
        errBody = "<unreadable>";
      }
      console.info(`[${src}] - ${method} - FAIL: ${errBody}`);
      throw new Error(`HTTP error! status: ${response.status} - ${errBody}`);
    }

    const data = await response.json();
    console.info(`[${src}] - ${method} - SUCCESS: `, data);
    return data;
  } catch (err) {
    clearTimeout(timer);
    if (externalSignal && externalListener) externalSignal.removeEventListener('abort', externalListener);
    if (err.name === "AbortError") {
      console.info(`[${src}] - ${method} - TIMEOUT/ABORT after ${timeout}ms`);
      const e = new Error("API Called timeout");
      e.name = 'AbortError';
      throw e;
    }
    // rethrow other errors
    throw err;
  }
};
