import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchRequest,
  fullTimezone,
  getBrowserTimeZone,
  offsetToMinutes,
} from "../utils";
import { LANGUAGE_ENUMS, TIME_COMPONENT_ENUMS } from "../enums";
import { useStoreContext } from "../contexts/storeContext";

const sharedTimeOptions = { timeZone: "UTC" };
// Helper: Convert a Date (local in selected timezone) to UTC Date
const toUTCDate = (date, offset) => {
  // offset in minutes
  const utc = new Date(date.getTime() - offset * 60000);
  return utc;
};

// Helper: Convert a UTC Date and offset to local Date in that timezone
const fromUTCDate = (utcDate, offset) => {
  return new Date(utcDate.getTime() + offset * 60000);
};

export const useTimeSetting = () => {
  const { language } = useStoreContext();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(null);
  const [liveTime, setLiveTime] = useState(null);
  const intervalIdRef = useRef();
  const [timezoneIndex, setTimezoneIndex] = useState(getBrowserTimeZone);
  const handleSetTimezoneIndex = useCallback((index) => {
    setTimezoneIndex(index);
  }, []);

  const liveTimePreviews = useMemo(() => {
    if (liveTime) {
      let locale = undefined;
      switch (language) {
        case LANGUAGE_ENUMS.EN:
          locale = "en-US";
          break;
        case LANGUAGE_ENUMS.VI:
          locale = "vi-VN";
          break;
        default:
          break;
      }
      return [
        liveTime.toLocaleDateString(locale, sharedTimeOptions),
        liveTime.toLocaleTimeString(locale, sharedTimeOptions),
      ];
    }
    return ["_", "_"];
  }, [liveTime, language]);

  const currentTimePreview = useMemo(() => {
    if (currentTime) {
      let locale = undefined;
      switch (language) {
        case LANGUAGE_ENUMS.EN:
          locale = "en-US";
          break;
        case LANGUAGE_ENUMS.VI:
          locale = "vi-VN";
          break;
        default:
          break;
      }
      return currentTime.toLocaleString(locale, sharedTimeOptions);
    }
    return "_";
  }, [currentTime, language]);

  const setComponent = useCallback(
    (name) => (event) => {
      const value = +event.target.value;
      if (value >= 0) {
        const next = new Date(currentTime || undefined);
        switch (name) {
          case TIME_COMPONENT_ENUMS.YEAR:
            next.setUTCFullYear(value);
            break;
          case TIME_COMPONENT_ENUMS.MONTH:
            next.setUTCMonth(value - 1);
            break;
          case TIME_COMPONENT_ENUMS.DAY:
            next.setUTCDate(value);
            break;
          case TIME_COMPONENT_ENUMS.HOUR:
            next.setUTCHours(value);
            break;
          case TIME_COMPONENT_ENUMS.MINUTE:
            next.setUTCMinutes(value);
            break;
          case TIME_COMPONENT_ENUMS.SECOND:
            next.setUTCSeconds(value);
            break;
          default:
            break;
        }
        setCurrentTime(next);
      }
    },
    [currentTime]
  );

  const components = useMemo(() => {
    if (currentTime) {
      return {
        year: currentTime.getUTCFullYear(),
        month: currentTime.getUTCMonth() + 1,
        day: currentTime.getUTCDate(),
        hour: currentTime.getUTCHours(),
        minute: currentTime.getUTCMinutes(),
        second: currentTime.getUTCSeconds(),
      };
    }
    return null;
  }, [currentTime]);

  const saveConfig = useCallback(() => {
    if (currentTime && timezoneIndex > -1) {
      const timeZone = fullTimezone[timezoneIndex];
      const offset = offsetToMinutes(timeZone.offset);
      // Convert local time in selected timezone to UTC
      const utcDate = toUTCDate(currentTime, offset);
      const components = {
        year: utcDate.getUTCFullYear(),
        month: utcDate.getUTCMonth() + 1,
        day: utcDate.getUTCDate(),
        hour: utcDate.getUTCHours(),
        minute: utcDate.getUTCMinutes(),
        second: utcDate.getUTCSeconds(),
      };
      setLoading(true);
      fetchRequest({
        src: "/time",
        method: "POST",
        payload: { ...components, timeZone: offset },
      })
        .then((res) => {
          const timeString = res?.time;
          if (
            timeString &&
            new Date(timeString).toString() !== "Invalid Date"
          ) {
            const timeZone = res.timeZone;
            const findIndex = fullTimezone.findIndex(
              (item) => offsetToMinutes(item.offset) === timeZone
            );
            setTimezoneIndex(findIndex);
            // Convert UTC from BE to local in selected timezone
            const utcDate = new Date(timeString);
            const adjustUTCTime = fromUTCDate(utcDate, timeZone);
            setCurrentTime(adjustUTCTime);
            setLiveTime(adjustUTCTime);
            if (intervalIdRef.current) {
              clearInterval(intervalIdRef.current);
            }
            intervalIdRef.current = setInterval(() => {
              setLiveTime((prev) => new Date(prev.getTime() + 1000));
            }, 1000);
          } else {
            setCurrentTime(null);
            setLiveTime(null);
            setTimezoneIndex(-1);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [currentTime, timezoneIndex]);

  useEffect(() => {
    // setLoading(true);
    fetchRequest({ src: "/time", method: "GET" })
      .then((res) => {
        const timeString = res?.time;
        if (timeString && new Date(timeString).toString() !== "Invalid Date") {
          const timeZone = res.timeZone;
          const findIndex = fullTimezone.findIndex(
            (item) => offsetToMinutes(item.offset) === timeZone
          );
          setTimezoneIndex(findIndex);
          // Set UTC date directly, do not add offset
          const utcDate = new Date(timeString);
          const adjustUTCTime = fromUTCDate(utcDate, timeZone);
          setCurrentTime(adjustUTCTime);
          setLiveTime(adjustUTCTime);
          intervalIdRef.current = setInterval(() => {
            setLiveTime((prev) => new Date(prev.getTime() + 1000));
          }, 1000);
        } else {
          setCurrentTime(null);
          setLiveTime(null);
          setTimezoneIndex(-1);
        }
      })
      .finally(() => {
        setLoading(false);
      });
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  return {
    currentTime,
    components,
    loading,
    liveTime,
    currentTimePreview,
    liveTimePreviews,
    timezoneIndex,
    setComponent,
    saveConfig,
    handleSetTimezoneIndex,
  };
};
