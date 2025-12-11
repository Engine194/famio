export const CookieUtils = {
  /**
   * Sets a cookie.
   * @param {string} name - The name of the cookie.
   * @param {string} value - The value of the cookie.
   * @param {number} [maxAge] - The number of second until the cookie expires. If not provided, days will be considered.
   * @param {number} [days] - The number of days until the cookie expires. If not provided, the cookie is a session cookie.
   * @param {string} [path='/'] - The path for which the cookie is valid.
   * @param {string} [domain] - The domain for which the cookie is valid.
   * @param {boolean} [secure=false] - Whether the cookie should only be sent over secure connections (HTTPS).
   * @param {'Lax'|'Strict'|'None'} [sameSite='Lax'] - The SameSite attribute for the cookie.
   */
  setCookie({
    name,
    value,
    days,
    maxAge,
    path = "/",
    domain,
    secure = false,
    sameSite = "Lax",
  }) {
    let expires = "";
    if (maxAge) {
      expires = `; max-age=${maxAge}`;
    } else if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = `; expires=${date.toUTCString()}`;
    }
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(
      value
    )}${expires}; path=${path}`;
    if (domain) {
      cookieString += `; domain=${domain}`;
    }
    if (secure) {
      cookieString += `; secure`;
    }
    if (sameSite) {
      cookieString += `; SameSite=${sameSite}`;
    }
    document.cookie = cookieString;
  },

  /**
   * Gets the value of a cookie.
   * @param {string} name - The name of the cookie to retrieve.
   * @returns {string|null} The value of the cookie, or null if not found.
   */
  getCookie(name) {
    const nameEQ = `${encodeURIComponent(name)}=`;
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  },

  /**
   * Deletes a cookie.
   * @param {string} name - The name of the cookie to delete.
   * @param {string} [path='/'] - The path of the cookie to delete.
   * @param {string} [domain] - The domain of the cookie to delete.
   */
  deleteCookie(name, path = "/", domain) {
    this.setCookie(name, "", -1, path, domain); // Set expiry to a past date
  },
};
