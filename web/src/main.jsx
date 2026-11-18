import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./style.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Aplicativo instalável (PWA): o service worker só é registrado na versão
// publicada, para não guardar arquivos antigos durante o desenvolvimento.
if (import.meta.env?.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((erro) => {
      console.error("Não foi possível registrar o service worker:", erro);
    });
  });
}
