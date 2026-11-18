// Roteador simples (sem biblioteca): troca de tela sem recarregar a página,
// usando o histórico do navegador. Se o projeto crescer, dá para trocar
// por React Router mantendo os mesmos nomes de rota.
import { useEffect, useState } from "react";

const EVENTO = "gepen:navegou";

export function navegar(destino, { substituir = false } = {}) {
  if (substituir) {
    window.history.replaceState(null, "", destino);
  } else {
    window.history.pushState(null, "", destino);
  }
  window.scrollTo(0, 0);
  window.dispatchEvent(new Event(EVENTO));
}

export function useLocalizacao() {
  const [local, setLocal] = useState(() => ({
    caminho: window.location.pathname,
    busca: window.location.search,
  }));

  useEffect(() => {
    function atualizar() {
      setLocal({ caminho: window.location.pathname, busca: window.location.search });
    }
    window.addEventListener("popstate", atualizar);
    window.addEventListener(EVENTO, atualizar);
    return () => {
      window.removeEventListener("popstate", atualizar);
      window.removeEventListener(EVENTO, atualizar);
    };
  }, []);

  return local;
}

// Compara um caminho com um padrão como "/painel/editar/:id".
// Devolve os parâmetros ({ id: "3" }) ou null se não combinar.
export function combinar(padrao, caminho) {
  const partesPadrao = padrao.split("/").filter(Boolean);
  const partesCaminho = caminho.split("/").filter(Boolean);
  if (partesPadrao.length !== partesCaminho.length) return null;

  const parametros = {};
  for (let i = 0; i < partesPadrao.length; i++) {
    if (partesPadrao[i].startsWith(":")) {
      parametros[partesPadrao[i].slice(1)] = decodeURIComponent(partesCaminho[i]);
    } else if (partesPadrao[i] !== partesCaminho[i]) {
      return null;
    }
  }
  return parametros;
}

// Link interno: navega sem recarregar. Ctrl+clique continua abrindo em nova aba.
export function Link({ to, onClick, ...props }) {
  function aoClicar(evento) {
    onClick?.(evento);
    if (
      evento.defaultPrevented ||
      evento.button !== 0 ||
      evento.metaKey ||
      evento.ctrlKey ||
      evento.shiftKey ||
      evento.altKey
    ) {
      return;
    }
    evento.preventDefault();
    navegar(to);
  }
  return <a href={to} onClick={aoClicar} {...props} />;
}
