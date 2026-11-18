// Funções para conversar com o servidor (Express).
import { navegar } from "./roteador.jsx";

// Erro de rede (sem internet ou servidor desligado).
export class SemConexao extends Error {}

// Faz a requisição e devolve { ok, status, dados }.
// Se a sessão expirou (401) nas rotas da área administrativa, vai para o login.
export async function requisitar(endereco, { metodo = "GET", corpo } = {}) {
  let resposta;
  try {
    resposta = await fetch(endereco, {
      method: metodo,
      headers: corpo ? { "Content-Type": "application/json" } : undefined,
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new SemConexao("Não foi possível conectar. Tente novamente.");
  }

  if (resposta.status === 401 && endereco.startsWith("/admin")) {
    navegar("/entrar", { substituir: true });
  }

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    // resposta sem JSON
  }

  return { ok: resposta.ok, status: resposta.status, dados };
}

// Para listas que o servidor sempre devolve (tipos, categorias, cards...).
export async function buscarLista(endereco) {
  const { ok, dados } = await requisitar(endereco);
  if (!ok || !Array.isArray(dados)) {
    throw new Error("Resposta inesperada de " + endereco);
  }
  return dados;
}
