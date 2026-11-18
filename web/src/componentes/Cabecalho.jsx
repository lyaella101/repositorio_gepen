import { requisitar } from "../api.js";
import { Link, navegar } from "../roteador.jsx";

// Cabeçalho do Figma. Público: "Entrar". Área administrativa: Alterar senha e Sair.
export default function Cabecalho({ area = "publica" }) {
  async function sair(evento) {
    evento.preventDefault();
    try {
      await requisitar("/logout", { metodo: "POST" });
    } finally {
      navegar("/entrar", { substituir: true });
    }
  }

  return (
    <header className="cabecalho">
      <Link className="cabecalho-marca" to="/">
        <span className="cabecalho-logo" aria-hidden="true"></span>
        Repositório GEPEN
      </Link>
      <nav className="cabecalho-acoes" aria-label="Conta">
        {area === "admin" ? (
          <>
            <Link to="/senha">Alterar senha</Link>
            <form method="POST" action="/logout" onSubmit={sair}>
              <button type="submit">Sair</button>
            </form>
          </>
        ) : (
          <Link to="/entrar">Entrar</Link>
        )}
      </nav>
    </header>
  );
}
