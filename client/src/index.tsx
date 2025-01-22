import React from "react";
import { createRoot } from "react-dom/client";
import "./reset.css";
import "./global.css";
import App from "./app";

const container = document.getElementById("app") || document.createElement("div");
container.id = "app";
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
