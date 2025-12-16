import { useCallback } from "react";
import { useI18nContext } from "../../contexts/i18nContext";
import { fetchRequest } from "../../utils";

const ResetWifiConfig = () => {
  const t = useI18nContext();
  const handleReset = useCallback(async () => {
    const response = await fetchRequest({
      src: "/wifi/reset",
      method: "POST",
    });
    console.log("response...", response);
  }, []);
  return (
    <div>
      <button type="button" onClick={handleReset}>
        {t({ id: "reset.wifi.config", mask: "Reset Wifi Configuration" })}
      </button>
    </div>
  );
};

export default ResetWifiConfig;
