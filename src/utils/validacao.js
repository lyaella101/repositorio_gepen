function urlValida(texto) {
  try {
    const url = new URL(texto);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
// Pras imagens
function urlHttpsValida(texto) {
  try {
    return new URL(texto).protocol === "https:";
  } catch {
    return false;
  }
}
