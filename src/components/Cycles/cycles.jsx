import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useI18nContext } from "../../contexts/i18nContext";
import { useDispatch, useStoreContext } from "../../contexts/storeContext";
import ListCycle from "./_listCycle";
import { STORE_ACTION_TYPES } from "../../contexts/actions";
import Dialog from "../Dialog";
import { CreateContent } from "./Actions";
import classes from "./cycles.module.css";
import { classNames, fetchRequest } from "../../utils";

const Cycles = () => {
  const t = useI18nContext();
  const { cycles, mode } = useStoreContext();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSaveMode = useCallback(() => {
    const nextMode = mode === 0 ? 2 : mode === 1 ? 0 : 1;
    setLoading(true);
    fetchRequest({ src: "/mode", method: "POST", payload: { mode: nextMode } })
      .then((data) => {
        dispatch({
          type: STORE_ACTION_TYPES.UPDATE_MODE,
          payload: data?.mode,
        });
      })
      .finally(() => setLoading(false));
  }, [mode, dispatch]);

  const modeLabel = useMemo(() => {
    switch (mode) {
      case 0:
        return t({ id: "mode.no", mask: "NO" });
      case 1:
        return t({ id: "mode.nc", mask: "NC" });
      default:
        return t({ id: "mode.auto", mask: "AUTO" });
    }
  }, [mode, t]);

  useEffect(() => {
    setLoading(true);
    fetchRequest({ src: "/config", method: "GET" })
      .then((data) => {
        dispatch({
          type: STORE_ACTION_TYPES.GET_CYCLES,
          payload: data?.cycles || [],
        });
        dispatch({
          type: STORE_ACTION_TYPES.GET_MODE,
          payload: data?.mode,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch]);

  return (
    <section className={classes.root}>
      <div className={classes.headingWrapper}>
        <h2 className={classes.heading}>
          {t({ id: "cycles", mask: "Cycles" })}
        </h2>
        <div className={classes.actionGroup}>
          <button
            type="button"
            disabled={loading}
            className={classNames(
              classes.modeBtn,
              mode === 1 ? classes.nc : mode === 0 ? classes.no : classes.auto
            )}
            onClick={handleSaveMode}
          >
            {modeLabel}
          </button>
          <button
            disabled={loading}
            className={classes.addBtn}
            onClick={() => setOpen(true)}
            type="button"
          >
            {"+"}
          </button>
        </div>
      </div>
      <ListCycle data={cycles} />
      <Dialog
        className={classes.dialog}
        open={open}
        title={t({ id: "add.cycle", mask: "Add cycle" })}
        onClose={handleClose}
        content={<CreateContent {...{ onClose: handleClose }} />}
      />
    </section>
  );
};

export default Cycles;
