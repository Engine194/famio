import React, { useCallback, useState } from "react";
import { useDispatch, useStoreContext } from "../../../contexts/storeContext";
import { useI18nContext } from "../../../contexts/i18nContext";
import TimeInput from "../../TimeInput";
import DelayInput from "../../DelayInput";
import { STORE_ACTION_TYPES } from "../../../contexts/actions";
import {
  classNames,
  combineTimeComponents,
  // convertLocalTimeToUTC,
  daysMap,
  fetchRequest,
} from "../../../utils";
import classes from "./_createContent.module.css";

const initialData = {
  status: 1,
  start: "00:00",
  end: "00:30",
  day: [1, 1, 1, 1, 1, 1, 1],
  fan_enable: 1,
  fan_delay: 30,
};

const CreateContent = (props) => {
  const { onClose } = props;
  const [cycle, setCycle] = useState({ ...initialData });
  const [loading, setLoading] = useState(false);
  const { cycles } = useStoreContext();
  const dispatch = useDispatch();
  const { day, status, start, end, fan_enable, fan_delay } = cycle;
  const { language } = useStoreContext();
  const t = useI18nContext();

  const handleSubmit = useCallback(() => {
    if (cycles.length < 5) {
      setLoading(true);
      fetchRequest({
        src: `/cycles`,
        method: "POST",
        payload: {
          ...cycle,
          // start: convertLocalTimeToUTC(cycle.start),
          // end: convertLocalTimeToUTC(cycle.end),
        },
      })
        .then((response) => {
          if (response?.id) {
            dispatch({
              type: STORE_ACTION_TYPES.ADD_CYCLE,
              payload: { ...response },
            });
            onClose && onClose();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [cycle, dispatch, onClose, cycles.length]);

  return (
    <React.Fragment>
      <h6 className={classes.title}>
        <b>{t({ id: "status", mask: "Status" })}</b>
        <button
          type="button"
          disabled={loading}
          className={classes.fanEnable}
          onClick={() =>
            setCycle((prev) => {
              const next = { ...prev };
              next.status = prev.status ? 0 : 1;
              return next;
            })
          }
        >
          <span className={classes.fanStatus}>
            {status
              ? t({ id: "on", mask: "ON" })
              : t({ id: "off", mask: "OFF" })}
          </span>
        </button>
      </h6>
      <hr className={classes.divider} />
      <h6 className={classes.title}>
        <span>{t({ id: "start.time", mask: "Start time" })}</span>
        <span className={classes.timeSelected}>{start}</span>
      </h6>
      <TimeInput
        initialValue={initialData.start}
        name="startTime"
        disabled={loading}
        setValue={(value) =>
          setCycle((prev) => {
            const next = { ...prev };
            next.start = combineTimeComponents(value);
            return next;
          })
        }
      />
      <hr className={classes.divider} />
      <h6 className={classes.title}>
        <span>{t({ id: "end.time", mask: "End time" })}</span>
        <span className={classes.timeSelected}>{end}</span>
      </h6>
      <TimeInput
        initialValue={initialData.end}
        disabled={loading}
        name="endTime"
        setValue={(value) =>
          setCycle((prev) => {
            const next = { ...prev };
            next.end = combineTimeComponents(value);
            return next;
          })
        }
      />
      <hr className={classes.divider} />
      <h6 className={classes.title}>
        <span>{t({ id: "repeat.on", mask: "Repeat on" })}</span>
        <div className={classes.days}>
          {[
            daysMap.get(language).map((label, index) => {
              const active = day[index];
              return (
                <button
                  type="button"
                  disabled={loading}
                  key={label}
                  onClick={() => {
                    setCycle((prev) => {
                      const next = { ...prev };
                      const nextDay = [...prev.day];
                      const prevValue = prev.day[index];
                      nextDay[index] = prevValue ? 0 : 1;
                      next.day = nextDay;
                      return next;
                    });
                  }}
                  className={classNames(classes.day, active && classes.active)}
                >
                  {label}
                </button>
              );
            }),
          ]}
        </div>
      </h6>
      <hr className={classes.divider} />
      <h6 className={classes.title}>
        <span>{t({ id: "fan.setting", mask: "Fan setting" })}</span>
        <button
          disabled={loading}
          type="button"
          className={classes.fanEnable}
          onClick={() =>
            setCycle((prev) => {
              const next = { ...prev };
              next.fan_enable = prev.fan_enable ? 0 : 1;
              return next;
            })
          }
        >
          <img
            src="/images/fan.png"
            alt="Fan"
            width={24}
            height={24}
            className={classes.fanIcon}
          />
          <span className={classes.fanStatus}>
            {fan_enable
              ? t({ id: "on", mask: "ON" })
              : t({ id: "off", mask: "OFF" })}
          </span>
        </button>
      </h6>
      {fan_enable ? (
        <>
          <div className={classes.fanSetting}>
            <div className={classes.fanDelay}>
              <img
                src="/images/hourglass.png"
                alt="Delay"
                width={24}
                height={24}
                className={classes.fanIcon}
              />
              <span className={classes.delayNumber}>
                {t({ id: "delay", mask: "Delay" })}
              </span>
            </div>
            <span className={classes.timeSelected}>
              {fan_delay} {t({ id: "minute.unit", mask: "min" })}
            </span>
          </div>
          <DelayInput
            name={"delay"}
            disabled={loading}
            initialValue={fan_delay}
            setValue={(value) => {
              setCycle((prev) => {
                const next = { ...prev };
                next.fan_delay = +value;
                return next;
              });
            }}
          />
        </>
      ) : null}
      <hr className={classes.divider} />
      <strong className={classes.note}>
        {t({
          id: "limit.5.cycles",
          mask: "Note*: You can create up to 5 cycles",
        })}
      </strong>
      <div className={classes.actionGroup}>
        <button
          disabled={loading || cycles.length >= 5}
          type="button"
          onClick={handleSubmit}
        >
          {t({ id: "create", mask: "Create" })}
        </button>
      </div>
    </React.Fragment>
  );
};

export default CreateContent;
