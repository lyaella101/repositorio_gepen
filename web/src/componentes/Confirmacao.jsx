import { useEffect, useRef } from "react";

export default function Confirmacao({
  aberta,
  titulo,
  children,
  textoConfirmar = "Confirmar",
  textoProcessando = "Aguarde...",
  processando = false,
  aoConfirmar,
  aoCancelar,
}) {
  const janela = useRef(null);

  useEffect(() => {
    const dialogo = janela.current;
    if (aberta && !dialogo.open) dialogo.showModal();
    if (!aberta && dialogo.open) dialogo.close();
  }, [aberta]);

  return (
    <dialog
      ref={janela}
      className="confirmacao"
      aria-labelledby="confirmacao_titulo"
      onClose={aoCancelar}
      onCancel={(evento) => {
        if (processando) evento.preventDefault();
      }}
      onClick={(evento) => {
        if (evento.target === janela.current && !processando) janela.current.close();
      }}
    >
      <h2 id="confirmacao_titulo">{titulo}</h2>
      {children}

      <div className="confirmacao-acoes">
        <button type="button" disabled={processando} onClick={() => janela.current.close()}>
          Cancelar
        </button>
        <button type="button" className="botao-perigo" disabled={processando} onClick={aoConfirmar}>
          {processando ? textoProcessando : textoConfirmar}
        </button>
      </div>
    </dialog>
  );
}