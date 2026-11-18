import Cabecalho from "../componentes/Cabecalho.jsx";
import { useTitulo } from "../hooks/useTitulo.js";
import { Link } from "../roteador.jsx";

export default function NaoEncontrada() {
  useTitulo("Página não encontrada");
  return (
    <>
      <Cabecalho />
      <main id="sem_conexao">
        <h1>Página não encontrada</h1>
        <p>O endereço pode estar errado, ou a página mudou de lugar.</p>
        <Link to="/">Ir para o catálogo</Link>
      </main>
    </>
  );
}
