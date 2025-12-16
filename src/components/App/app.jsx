import classes from "./app.module.css";
import { useI18nContext } from "../../contexts/i18nContext";
import FmRadio from "../FmRadio";
import ResetSystem from "../ResetSystem";
import ResetWifiConfig from "../ResetWifiConfig";

function App() {
  const t = useI18nContext();

  return (
    <>
      <h1 className={classes.heading}>
        {t({ id: "famio.dashboard", mask: "Welcome to Famio" })}
      </h1>
      <section>
        <FmRadio />
        <div className={classes.resetGroup}>
          <ResetSystem />
          <ResetWifiConfig />
        </div>
      </section>
    </>
  );
}

export default App;
