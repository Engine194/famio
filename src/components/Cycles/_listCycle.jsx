import React, { useState } from "react";
import { useI18nContext } from "../../contexts/i18nContext";
import { useStoreContext } from "../../contexts/storeContext";
import CycleAction from "./_cycleAction";
import { classNames, daysMap } from "../../utils";
import classes from "./_listCycle.module.css";

const ListCycle = (props) => {
  const { data = [] } = props || {};
  const { language } = useStoreContext();
  const t = useI18nContext();
  const selectState = useState("");
  return (
    <ul className={classes.root}>
      {data?.length
        ? data.map((item) => {
            const { id, start, end, day, status, fan_delay, fan_enable } = item;
            return (
              <li key={id} className={classes.cycle}>
                <CycleAction
                  {...{
                    data: item,
                    selectState,
                    className: classes.action,
                    activeClassName: classes.dropdownActive,
                  }}
                />
                <div className={classes.cycleStatus}>
                  <span className={classes.statusLabel}>
                    {t({ id: "status", mask: "Status" })}
                    {""}
                  </span>
                  <span className={classes.status}>
                    {status
                      ? t({ id: "on", mask: "ON" })
                      : t({ id: "off", mask: "OFF" })}
                  </span>
                </div>
                <div className={classes.clock}>
                  <p>
                    <span>
                      {t({ id: "from", mask: "From" })}
                      {": "}
                    </span>
                    <span>{start}</span>
                  </p>
                  <p>
                    <span>
                      {t({ id: "to", mask: "To" })}
                      {": "}
                    </span>
                    <span>{end}</span>
                  </p>
                </div>
                <ol className={classes.days}>
                  {[
                    daysMap.get(language).map((label, index) => {
                      const active = day[index];
                      return (
                        <li
                          key={label}
                          className={classNames(
                            classes.day,
                            active && classes.active
                          )}
                        >
                          {label}
                        </li>
                      );
                    }),
                  ]}
                </ol>
                <div className={classes.fanSetting}>
                  <div className={classes.fanEnable}>
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
                  </div>
                  {fan_enable ? (
                    <div className={classes.fanDelay}>
                      <img
                        src="/images/hourglass.png"
                        alt="Delay"
                        width={24}
                        height={24}
                        className={classes.fanIcon}
                      />
                      <span className={classes.delayNumber}>
                        {fan_delay} {t({ id: "minute.unit", mask: "min" })}
                      </span>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })
        : null}
    </ul>
  );
};

export default ListCycle;
