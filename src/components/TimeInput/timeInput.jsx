import React, { useState } from "react";
import classes from "./timeInput.module.css";
import { getTimeComponents, timeSelections } from "../../utils";
import Picker from "react-mobile-picker";

const TimeInput = (props) => {
  const { name = "time", setValue, disabled, initialValue } = props || {};
  const [pickerValue, setPickerValue] = useState(
    initialValue
      ? getTimeComponents(initialValue)
      : {
          hour: 0,
          minute: 0,
        }
  );

  return (
    <div className={classes.root}>
      <Picker
        disabled={disabled}
        name={name}
        value={pickerValue}
        onChange={(value) => {
          setPickerValue(value);
          if (setValue) {
            setValue((value));
          }
        }}
        wheelMode="normal"
        height={150}
      >
        {Object.keys(timeSelections).map((name) => (
          <Picker.Column key={name} name={name}>
            {timeSelections[name].map((option) => (
              <Picker.Item key={option} value={option}>
                {option}
              </Picker.Item>
            ))}
          </Picker.Column>
        ))}
      </Picker>
    </div>
  );
};

export default TimeInput;
