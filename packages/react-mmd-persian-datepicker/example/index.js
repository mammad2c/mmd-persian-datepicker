import React from "react";
import ReactDOM from "react-dom";

import MmdPersianDatepicker from "../src/ReactComponent";

function App() {
  return <MmdPersianDatepicker />;
}

const mountNode = document.getElementById("app");
ReactDOM.render(<App />, mountNode);
