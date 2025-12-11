/* eslint-disable react-refresh/only-export-components */
import React, { useCallback, useContext, useMemo } from "react";
import { useStoreContext } from "./storeContext";
import { LANGUAGE_ENUMS } from "../enums";
import enData from "../i18n/en.json";
import viData from "../i18n/vi.json";

const I18nContext = React.createContext();

const I18nContextProvider = ({ children }) => {
  const { language } = useStoreContext();
  const data = useMemo(() => {
    switch (language) {
      case LANGUAGE_ENUMS.EN:
        return new Map(Object.entries(enData));
      case LANGUAGE_ENUMS.VI:
        return new Map(Object.entries(viData));
      default:
        return new Map();
    }
  }, [language]);

  const t = useCallback(
    (props) => {
      const { id = "", mask = "", values } = props || {};
      let findValue = data.get(id);
      if (!findValue) {
        findValue = mask;
      }
      if (!findValue) return id;
      if (values?.length) {
        const breakdownList = values.reduce(
          (acc, _, i) =>
            acc
              .flatMap((item) => {
                return item.split(new RegExp(`(\\{${i}\\})`));
              })
              .filter(Boolean),
          [findValue]
        );
        values.forEach((replacement, i) => {
          const replacePhrase = "{" + i + "}";
          breakdownList.forEach((item, j, arr) => {
            if (typeof item === "string" && item === replacePhrase) {
              arr[j] = replacement;
            }
          });
        });
        if (
          breakdownList.every((item) =>
            ["number", "string", "bigint"].includes(typeof item)
          )
        ) {
          return breakdownList.join("");
        }
        return breakdownList;
      }
      return findValue;
    },
    [data]
  );

  return <I18nContext.Provider value={t}>{children}</I18nContext.Provider>;
};

export default I18nContextProvider;
export const useI18nContext = () => useContext(I18nContext);
