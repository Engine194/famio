import React from "react";
import classes from "./dialog.module.css";
import { classNames } from "../../utils";

const Dialog = (props) => {
  const { title, className, content, open, onClose } = props;
  return (
    <dialog
      open={open}
      className={classNames(
        classes.root,
        className,
        open ? classes.open : classes.close
      )}
    >
      <div className={classes.cover}>
        <div className={classes.container}>
          <button
            type="button"
            onClick={() => onClose()}
            className={classes.closeBtn}
          >
            +
          </button>
          <h5 className={classes.title}>{title}</h5>
          <div className={classes.content}>{content}</div>
        </div>
      </div>
    </dialog>
  );
};

export default Dialog;
