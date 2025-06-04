import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import Modal from "react-modal";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);
Modal.setAppElement('#root');
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
