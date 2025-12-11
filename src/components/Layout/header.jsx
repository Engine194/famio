import { Fragment, useCallback } from "react";
import { useI18nContext } from "../../contexts/i18nContext";
import { useDispatch, useStoreContext } from "../../contexts/storeContext";
import logo from "../../logo.png";
import { classNames } from "../../utils";
import classes from "./header.module.css";
import { STORE_ACTION_TYPES } from "../../contexts/actions";

const Header = () => {
  const t = useI18nContext();
  const { language } = useStoreContext();
  const dispatch = useDispatch();
  const handleChangeLanguage = useCallback(
    (value) => {
      dispatch({
        type: STORE_ACTION_TYPES.UPDATE_LANGUAGE,
        payload: value.toLowerCase(),
      });
    },
    [dispatch]
  );
  return (
    <header className={classes.header}>
      <div className={classes.container}>
        <div className={classes.logoWrapper}>
          <img
            width={48}
            height={48}
            src={logo}
            className={classes.logo}
            alt="logo"
          />
          <strong className={classes.logoTitle}>
            {t({ id: "logo.title", mask: "FAMIO" })}
          </strong>
        </div>
        <div className={classes.languages}>
          {["EN", "VI"].map((item) => {
            return (
              <Fragment key={item}>
                <button
                  type="button"
                  className={classNames(
                    classes.languageItem,
                    item.toLowerCase() === language && classes.active
                  )}
                  onClick={() => handleChangeLanguage(item)}
                >
                  {item}
                </button>
              </Fragment>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Header;
