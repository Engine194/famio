import classes from "./app.module.css";
import { useI18nContext } from "../../contexts/i18nContext";

function App() {
  const t = useI18nContext();

  return (
    <>
      <h1 className={classes.heading}>
        {t({ id: "staruv.dashboard", mask: "StarUV Dashboard" })}
      </h1>
    </>
  );
}

export default App;
