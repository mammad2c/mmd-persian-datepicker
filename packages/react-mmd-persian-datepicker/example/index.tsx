import React, { useState } from "react";
import ReactDOM from "react-dom";
import MmdPersianDatepicker from "../src/ReactComponent";

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
        <button onClick={() => setDate(["1399/05/25", "1399/05/28"])}>
          setDate Value
        </button>
        <button onClick={(): void => setActive(!active)}>Toggle active</button>
      </div>
      {active && (
        <MmdPersianDatepicker
          mode="range"
          numberOfMonths={2}
          inline
          defaultValue={date}
          onChange={(selectedDates) => {
            setDate(selectedDates);
          }}
        />
      )}
    </div>
  );
}

const mountNode = document.getElementById("app");
ReactDOM.render(<App />, mountNode);
