import { useNavigate } from "react-router-dom";
import { useDispatch } from "../../contexts/storeContext";
import { useEffect } from "react";
import { fetchRequest } from "../../utils";
import { STORE_ACTION_TYPES } from "../../contexts/actions";
import { useI18nContext } from "../../contexts/i18nContext";

const Provisioning = ({ children }) => {
  const nav = useNavigate();
  const t = useI18nContext();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: STORE_ACTION_TYPES.START_LOADING });
    const status = {
      isOperational: false,
      ip: "",
    };
    fetchRequest({ method: "GET", src: "/wifi/status" })
      .then((response) => {
        const { isOperational = false, ip = "" } = response || {};
        console.log('response...', response)
        status.isOperational = isOperational;
        status.ip = ip;
      })
      .catch((error) => {
        console.error("error...", error);
      })
      .finally(() => {
        if (status.ip?.length > 0) {
          dispatch({ type: STORE_ACTION_TYPES, payload: status });
          if (!status.isOperational) {
            nav("/explore");
          } else {
            nav("/");
          }
        } else {
          nav("/error", {
            state: {
              message: t({
                id: "error.network.fail",
                mask: "Network init failed",
              }),
            },
          });
        }
        dispatch({ type: STORE_ACTION_TYPES.END_LOADING });
      });
  }, [dispatch, nav, t]);

  return <>{children}</>;
};

export default Provisioning;
