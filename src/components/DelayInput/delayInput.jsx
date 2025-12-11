import React, { useState } from "react";
import classes from "./delayInput.module.css";
import Picker from "react-mobile-picker";

const start = 5;
const end = 60;
const selections = {
  value: Array.from({ length: end - start + 1 }, (_, index) => start + index),
};

const DelayInput = (props) => {
  const { name = "time", setValue, disabled, initialValue } = props || {};
  const [pickerValue, setPickerValue] = useState({
    value: initialValue || start,
  });

  return (
    <div className={classes.root}>
      <Picker
        name={name}
        disabled={disabled}
        value={pickerValue}
        onChange={(value) => {
          setPickerValue(value);
          setValue(value.value);
        }}
        wheelMode="normal"
        height={150}
      >
        {Object.keys(selections).map((name) => (
          <Picker.Column key={name} name={name}>
            {selections[name].map((option) => (
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

export default DelayInput;
