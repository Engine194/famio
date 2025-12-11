import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "../../contexts/storeContext";
import { useI18nContext } from "../../contexts/i18nContext";
import { EllipsisVertical } from "../Icons";
import Dialog from "../Dialog";
import { UpdateContent } from "./Actions";
import { STORE_ACTION_TYPES } from "../../contexts/actions";
import { classNames } from "../../utils";
import classes from "./_cycleAction.module.css";

const CycleAction = (props) => {
  const {
    className = "",
    activeClassName = "",
    selectState,
    data,
  } = props || {};
  const t = useI18nContext();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [id, setId] = selectState;
  const active = id === data.id;
  const [openUpdate, setOpenUpdate] = useState(false);
  const handleClose = useCallback(() => {
    setOpenUpdate(false);
    setId("");
  }, [setId]);

  const handleDelete = useCallback(
    (id) => {
      if (id) {
        setLoading(true);
        fetch(`${window.location.origin}/cycles?id=${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((response) => {
            if (response?.id) {
              dispatch({
                type: STORE_ACTION_TYPES.DELETE_CYCLE,
                payload: { id: response.id },
              });
              setId("");
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    },
    [dispatch, setId]
  );

  useEffect(() => {
    const controller = new AbortController();
    window.addEventListener(
      "click",
      () => {
        setId("");
      },
      { signal: controller.signal }
    );

    return () => {
      controller.abort();
    };
  }, [setId]);

  return (
    <div
      onClick={(event) => event.stopPropagation()}
      className={classNames(classes.root, className)}
    >
      <button
        disabled={loading}
        type="button"
        className={classNames(
          classes.mainBtn,
          active && classes.active,
          active && activeClassName
        )}
        onClick={() => setId(data.id)}
      >
        <EllipsisVertical />
      </button>
      {active && !openUpdate ? (
        <div className={classes.dropdownAction}>
          <ul className={classes.menu}>
            <li>
              <button
                disabled={loading}
                className={classes.actionBtn}
                type="button"
                onClick={() => setOpenUpdate(true)}
              >
                {t({ id: "update" })}
              </button>
            </li>
            <li>
              <button
                disabled={loading}
                className={classes.actionBtn}
                type="button"
                onClick={() => handleDelete(id)}
              >
                {t({ id: "delete" })}
              </button>
            </li>
          </ul>
        </div>
      ) : null}

      <Dialog
        className={classes.dialog}
        open={openUpdate}
        title={t({ id: "update.cycle", mask: "Update cycle" })}
        onClose={handleClose}
        content={<UpdateContent {...{ data, onClose: handleClose }} />}
      />
    </div>
  );
};

export default CycleAction;
