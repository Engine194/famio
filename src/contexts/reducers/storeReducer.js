import {
  // convertUTCTimeToLocal,
  CookieUtils,
} from "../../utils";
import { STORE_ACTION_TYPES } from "../actions/storeContext.action";

export const initState = {
  language: CookieUtils.getCookie("language") || "vi",
  loading: false,
  provisioning: {
    isOperational: false,
    ip: "",
  },
  wifiNetworks: [],
};

export const storeReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case STORE_ACTION_TYPES.GET_LANGUAGE:
    case STORE_ACTION_TYPES.UPDATE_LANGUAGE: {
      CookieUtils.setCookie({ name: "language", value: payload, days: 365 });
      return { ...state, language: payload };
    }
    case STORE_ACTION_TYPES.START_LOADING:
      return { ...state, loading: true };
    case STORE_ACTION_TYPES.END_LOADING:
      return { ...state, loading: false };
    case STORE_ACTION_TYPES.SET_PROVISIONING:
      return { ...state, provisioning: payload };
    case STORE_ACTION_TYPES.SET_WIFI_NETWORKS:
      return { ...state, wifiNetworks: payload };
    case STORE_ACTION_TYPES.RESET_WIFI_NETWORKS:
      return { ...state, wifiNetworks: [] };
    default:
      return state;
  }
};
