// Registra o service worker (public/sw.js), que permite instalar o
// Repositório GEPEN como aplicativo e abrir o catálogo sem internet.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((erro) => {
      console.error("Não foi possível registrar o service worker:", erro);
    });
  });
}
