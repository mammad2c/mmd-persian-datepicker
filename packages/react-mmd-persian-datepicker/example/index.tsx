import React, { useState } from "react";
import ReactDOM from "react-dom";
import MmdPersianDatepicker from "../src/ReactComponent";

function CustomInput({ inputRef, ...props }: any) {
  return <input {...props} ref={inputRef} />;
}

function App(): JSX.Element {
  const [active, setActive] = useState(true);
  const [date, setDate] = useState<any>();

  return (
    <div>
      <div
        style={{
          marginBottom: 30,
        }}
      >
        <button onClick={(): void => setDate(["1399/05/25", "1399/05/28"])}>
          setDate Value
        </button>
        <button onClick={(): void => setActive(!active)}>Toggle active</button>
      </div>
      {active && (
        <MmdPersianDatepicker
          mode="range"
          numberOfMonths={2}
          customRender={(inputProps, ref) => {
            return <CustomInput {...inputProps} inputRef={ref} />;
          }}
          defaultValue={date}
          onChange={(selectedDates) => {
            if (!selectedDates) {
              return;
            }
            setDate(selectedDates);
          }}
        />
      )}
    </div>
  );
}

const mountNode = document.getElementById("app");
ReactDOM.render(<App />, mountNode);
