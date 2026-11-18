import { useEffect, useState } from "react";
import { requisitar, SemConexao } from "../api.js";
import Cabecalho from "../componentes/Cabecalho.jsx";
import FormularioRecomendacao from "../componentes/FormularioRecomendacao.jsx";
import Mensagem from "../componentes/Mensagem.jsx";
import { useTitulo } from "../hooks/useTitulo.js";
import { Link } from "../roteador.jsx";

export default function EditarRecomendacao({ id }) {
  useTitulo("Editar recomendação");
  const cardId = Number(id);
  const idValido = Number.isInteger(cardId) && cardId > 0;
  const [inicial, setInicial] = useState(null);
  const [mensagem, setMensagem] = useState(
    idValido ? { tipo: "", texto: "Carregando..." } : { tipo: "erro", texto: "Recomendação inválida." },
  );

  useEffect(() => {
    if (!idValido) return;
    requisitar(`/admin/cards/${cardId}`)
      .then(({ ok, status, dados }) => {
        if (status === 401) return;
        if (status === 404) {
          setMensagem({ tipo: "erro", texto: "Esta recomendação não existe ou já foi excluída." });
          return;
        }
        if (!ok) throw new Error();
        setInicial({
          titulo: dados.titulo,
          descricao: dados.descricao,
          url: dados.url,
          tipoId: String(dados.tipo_id),
          categoriaId: String(dados.categoria_id),
          nivelId: String(dados.nivel_id),
          idioma: dados.idioma,
          observacoes: dados.observacoes ?? "",
          tags: dados.tags,
        });
        setMensagem(null);
      })
      .catch(() => setMensagem({ tipo: "erro", texto: "Não foi possível carregar a recomendação." }));
  }, [cardId, idValido]);

  async function salvar(dados) {
    setMensagem(null);
    try {
      const { ok, status, dados: resposta } = await requisitar(`/admin/cards/${cardId}`, {
        metodo: "PUT",
        corpo: dados,
      });
      if (status === 401) return false;
      setMensagem(
        ok
          ? { tipo: "sucesso", texto: resposta.message }
          : { tipo: "erro", texto: resposta?.error ?? "Não foi possível salvar." },
      );
    } catch (e) {
      setMensagem({ tipo: "erro", texto: e instanceof SemConexao ? e.message : "Erro ao salvar." });
    }
    return false; // na edição, o formulário continua preenchido
  }

  return (
    <>
      <Cabecalho area="admin" />
      <Link to="/painel">Voltar</Link>
      <h1>Editar recomendação</h1>
      <p>* campos obrigatórios</p>

      {inicial && (
        <FormularioRecomendacao
          inicial={inicial}
          aoSalvar={salvar}
          aoErro={(texto) => setMensagem({ tipo: "erro", texto })}
        />
      )}
      <Mensagem mensagem={mensagem} />
    </>
  );
}
