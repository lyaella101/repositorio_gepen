import { useEffect } from "react";

// Muda o título da aba do navegador.
export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo;
  }, [titulo]);
}
