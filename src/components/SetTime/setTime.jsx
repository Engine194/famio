import React from "react";
import { useI18nContext } from "../../contexts/i18nContext";
import { useTimeSetting } from "../../hooks";
import { TIME_COMPONENT_ENUMS } from "../../enums";
import classes from "./setTime.module.css";
import { fullTimezone, getBrowserTimeZone } from "../../utils";

const SetTime = () => {
  const t = useI18nContext();
  const {
    loading,
    components,
    timezoneIndex,
    currentTimePreview,
    liveTimePreviews,
    setComponent,
    saveConfig,
    handleSetTimezoneIndex,
  } = useTimeSetting();

  const {
    year = 0,
    month = 0,
    day = 0,
    hour = 0,
    minute = 0,
    second = 0,
  } = components || {};

  return (
    <section className={classes.root}>
      <h2 className={classes.heading}>
        {t({ id: "time.setting", mask: "Time Setting" })}
      </h2>
      <form
        className={classes.timeForm}
        onSubmit={(e) => {
          e.preventDefault();
          saveConfig();
        }}
      >
        <p className={classes.explain}>
          {t({ id: "date.explain", mask: "Year / month / day" })}
        </p>
        <div className={classes.realTimeLabel}>
          {t({ id: "real.time", mask: "Real-time" })}
        </div>
        <div className={classes.timeDisplay}>
          <input
            name="year"
            type="number"
            value={year}
            onChange={setComponent(TIME_COMPONENT_ENUMS.YEAR)}
            disabled={loading}
            step={1}
            min={0}
            max={9999}
          />
          <span>{"/"}</span>
          <input
            name="month"
            type="number"
            value={month}
            onChange={setComponent(TIME_COMPONENT_ENUMS.MONTH)}
            disabled={loading}
            step={1}
            min={1}
            max={12}
          />
          <span>{"/"}</span>
          <input
            name="day"
            type="number"
            value={day}
            onChange={setComponent(TIME_COMPONENT_ENUMS.DAY)}
            disabled={loading}
            step={1}
            min={1}
            max={31}
          />
        </div>
        <div className={classes.realTimeDate}>{liveTimePreviews[0]}</div>
        <div className={classes.delimiter} />
        <p className={classes.explain}>
          {t({ id: "time.explain", mask: "Hour : Minute : Second" })}
        </p>
        <div className={classes.realTimeHour}>{liveTimePreviews[1]}</div>
        <div className={classes.timeDisplay}>
          <input
            name="hour"
            type="number"
            value={hour}
            onChange={setComponent(TIME_COMPONENT_ENUMS.HOUR)}
            disabled={loading}
            min={0}
            max={23}
          />
          <span>{":"}</span>
          <input
            name="minute"
            type="number"
            value={minute}
            onChange={setComponent(TIME_COMPONENT_ENUMS.MINUTE)}
            disabled={loading}
            min={0}
            max={59}
          />
          <span>{":"}</span>
          <input
            name="second"
            type="number"
            value={second}
            onChange={setComponent(TIME_COMPONENT_ENUMS.SECOND)}
            disabled={loading}
            min={0}
            max={59}
          />
        </div>
        <span />
        <div className={classes.delimiter} />
        <div className={classes.timezoneWrapper}>
          <select
            className={classes.timezoneSelection}
            name="timezone-offset"
            onChange={(event) => handleSetTimezoneIndex(+event.target.value)}
            value={timezoneIndex}
          >
            {fullTimezone.map(({ offset, example_locations }, index) => {
              return (
                <option
                  key={offset}
                  value={index}
                >{`${offset}: ${example_locations}`}</option>
              );
            })}
          </select>
          <button
            type="button"
            onClick={() => handleSetTimezoneIndex(getBrowserTimeZone())}
          >
            {t({ id: "auto", mask: "Auto" })}
          </button>
        </div>
        <div className={classes.delimiter} />
        <p className={classes.currentTimePreview}>{currentTimePreview}</p>
        <button className={classes.saveBtn} disabled={loading} type="submit">
          {t({ id: "save", mask: "Save" })}
        </button>
      </form>
    </section>
  );
};

export default SetTime;
