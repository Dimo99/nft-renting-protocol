import React from "react";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import App from "./App";

// // @ts-ignore
// declare global {
//   // tslint:disable-next-line
//   interface Window {
//     web3: any;
//     ethereum: any;
//     Web3Modal: any;
//     Box: any;
//     box: any;
//     space: any;
//   }
// }

ReactDOM.render(
  <>
    <App />
  </>,
  document.getElementById("root")
);
