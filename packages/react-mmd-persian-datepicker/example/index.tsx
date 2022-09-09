import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import MmdPersianDatepicker from "../src";

const CustomInput: React.FC<{
  inputRef: (node: React.RefObject<HTMLInputElement>) => void;
}> = ({ inputRef, ...props }: any) => <input {...props} ref={inputRef} />;

const App: React.FC = () => {
  const [active, setActive] = useState(true);
  const [date, setDate] = useState<any>([]);
  const [disabledDates, setDisabledDates] = useState<string[]>([]);

  return (
    <div>
      <div
        style={{
          marginBottom: 30,
        }}
      >
        <button onClick={(): void => setDate(["1399/03/25", "1399/03/28"])}>
          setDate Value
        </button>
        &nbsp;
        <button
          onClick={(): void => {
            setDisabledDates(["1399/03/25", "1399/03/28"]);
          }}
        >
          disable some dates
        </button>
        &nbsp;
        <button onClick={(): void => setActive(!active)}>Toggle active</button>
      </div>
      {active && (
        <MmdPersianDatepicker
          mode="range"
          inline
          disabledDates={disabledDates}
          numberOfMonths={2}
          customRender={(inputProps, ref) => {
            return <CustomInput {...inputProps} inputRef={ref} />;
          }}
          defaultValue={date}
          onChange={(selectedDates) => {
            setDate(selectedDates);
          }}
        />
      )}
    </div>
  );
};

const mountNode = document.getElementById("app");

if (mountNode) {
  const root = createRoot(mountNode);
  root.render(<App />);
}
