// Mensagem de retorno (sucesso em verde, erro em vermelho), lida por leitores de tela.
// "mensagem" é { texto, tipo: "sucesso" | "erro" | "" }.
const CORES = { sucesso: "green", erro: "red" };

export default function Mensagem({ id = "mensagem", mensagem }) {
  return (
    <p id={id} aria-live="polite" style={{ color: CORES[mensagem?.tipo] }}>
      {mensagem?.texto ?? ""}
    </p>
  );
}
