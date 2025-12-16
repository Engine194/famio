import { useCallback } from "react";
import { useI18nContext } from "../../contexts/i18nContext";
import { fetchRequest } from "../../utils";

const ResetSystem = () => {
  const t = useI18nContext();
  const handleReset = useCallback(async () => {
    const response = await fetchRequest({
      src: "/system/reset",
      method: "POST",
    });
    console.log("response...", response);
  }, []);
  return (
    <div>
      <button type="button" onClick={handleReset}>
        {t({ id: "reset.system", mask: "Reset System" })}
      </button>
    </div>
  );
};

export default ResetSystem;
