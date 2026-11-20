import { useEffect, useRef } from "react";

export default function Mensagem({ id = "mensagem", mensagem }) {
  const ref = useRef(null);
  const texto = mensagem?.texto ?? "";
  const tipo = mensagem?.tipo ?? "";

  useEffect(() => {
    if (texto && tipo) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [texto, tipo]);

  return (
    <p
      id={id}
      ref={ref}
      aria-live="polite"
      className={tipo ? `aviso aviso-${tipo}` : undefined}
    >
      {texto}
    </p>
  );
}
