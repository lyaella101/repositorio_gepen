import { useEffect, useState } from "react";
import { requisitar } from "../api.js";

// Confere se há alguém logado. Sem login, o requisitar() já leva para /entrar.
// Devolve { usuario: { nome, papel } | null, erro }.
export function useSessao() {
  const [usuario, setUsuario] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    requisitar("/admin/eu")
      .then(({ ok, status, dados }) => {
        if (!ativo || status === 401) return;
        if (!ok) throw new Error("Resposta inesperada: " + status);
        setUsuario(dados);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível carregar o painel. Tente recarregar a página.");
      });
    return () => {
      ativo = false;
    };
  }, []);

  return { usuario, erro };
}
