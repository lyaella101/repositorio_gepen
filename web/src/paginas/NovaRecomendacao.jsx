import { useState } from "react";
import { requisitar, SemConexao } from "../api.js";
import Cabecalho from "../componentes/Cabecalho.jsx";
import FormularioRecomendacao from "../componentes/FormularioRecomendacao.jsx";
import Mensagem from "../componentes/Mensagem.jsx";
import { useSessao } from "../hooks/useSessao.js";
import { useTitulo } from "../hooks/useTitulo.js";
import { Link } from "../roteador.jsx";

export default function NovaRecomendacao() {
  useTitulo("Nova recomendação");
  useSessao();
  const [mensagem, setMensagem] = useState(null);

  async function salvar(dados) {
    setMensagem(null);
    try {
      const {
        ok,
        status,
        dados: resposta,
      } = await requisitar("/admin/cards", { metodo: "POST", corpo: dados });
      if (status === 401) return false;
      if (ok) {
        setMensagem({ tipo: "sucesso", texto: resposta.message });
        return true;
      }
      setMensagem({
        tipo: "erro",
        texto: resposta?.error ?? "Não foi possível salvar.",
      });
    } catch (e) {
      setMensagem({
        tipo: "erro",
        texto: e instanceof SemConexao ? e.message : "Erro ao salvar.",
      });
    }
    return false;
  }

  return (
    <>
      <Cabecalho area="admin" />
      <Link to="/painel">Voltar</Link>
      <h1>Nova recomendação</h1>
      <p>* campos obrigatórios</p>

      <Mensagem mensagem={mensagem} />

      <FormularioRecomendacao
        aoSalvar={salvar}
        aoErro={(texto) => setMensagem({ tipo: "erro", texto })}
      />
    </>
  );
}
