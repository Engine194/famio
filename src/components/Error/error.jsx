import { Link, useLocation, useRouteError } from "react-router-dom";
import { useI18nContext } from "../../contexts/i18nContext";
import classes from "./error.module.css";

const Error = () => {
  const t = useI18nContext();
  const defaultMessage = t({
    id: "error.default",
    mask: "Something went wrong!",
  });
  const title = t({ id: "error.title", mask: "Something went wrong" });
  const location = useLocation();
  const routeError = useRouteError();

  const message =
    location?.state?.message ||
    (routeError && (routeError.message || routeError.statusText)) ||
    defaultMessage;

  return (
    <div className={classes.wrapper}>
      <div className={classes.card} role="alert">
        <div className={classes.icon} aria-hidden>
          ⚠️
        </div>
        <h1 className={classes.title}>{title}</h1>
        <p className={classes.message}>{message}</p>
        <div className={classes.actions}>
          <Link to="/" className={classes.button}>
            {t({ id: "error.home", mask: "Go Home" })}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error;
