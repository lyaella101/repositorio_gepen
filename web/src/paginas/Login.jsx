import { useEffect, useState } from "react";
import { requisitar, SemConexao } from "../api.js";
import Cabecalho from "../componentes/Cabecalho.jsx";
import { useTitulo } from "../hooks/useTitulo.js";
import { navegar } from "../roteador.jsx";

export default function Login() {
  useTitulo("Login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Quem já está logado vai direto para o painel.
  useEffect(() => {
    fetch("/admin/eu")
      .then((resposta) => {
        if (resposta.ok) navegar("/painel", { substituir: true });
      })
      .catch(() => {});
  }, []);

  async function entrar(evento) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const { ok, dados } = await requisitar("/login", { metodo: "POST", corpo: { email, senha } });
      if (ok) {
        navegar("/painel", { substituir: true });
        return;
      }
      setErro(dados?.error ?? "Não foi possível entrar.");
    } catch (e) {
      setErro(e instanceof SemConexao ? "Não foi possível conectar ao servidor. Tente novamente." : "Erro ao entrar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Cabecalho />
      <h1>Login</h1>
      <form id="formulario-login" method="POST" action="/login" onSubmit={entrar}>
        <label>
          E-mail
          <input type="email" name="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Senha
          <input
            type="password"
            name="senha"
            required
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </label>
        <button type="submit" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p id="error-message" aria-live="polite">
        {erro}
      </p>
    </>
  );
}
