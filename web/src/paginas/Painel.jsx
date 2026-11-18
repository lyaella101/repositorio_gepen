import { useEffect, useMemo, useState } from "react";
import { buscarLista, requisitar, SemConexao } from "../api.js";
import Cabecalho from "../componentes/Cabecalho.jsx";
import Mensagem from "../componentes/Mensagem.jsx";
import Opcoes from "../componentes/Opcoes.jsx";
import { useOpcoes } from "../hooks/useOpcoes.js";
import { useSessao } from "../hooks/useSessao.js";
import { useTitulo } from "../hooks/useTitulo.js";
import { Link } from "../roteador.jsx";
import { classificacao, formatarData, IDIOMAS, nomesDasTags, semAcentos } from "../util.js";

const FILTROS_VAZIOS = { busca: "", tipoId: "", categoriaId: "", nivelId: "", idioma: "" };

export default function Painel() {
  useTitulo("Área administrativa");
  const { usuario, erro: erroSessao } = useSessao();
  const { tipos, categorias, niveis, erro: erroOpcoes } = useOpcoes();
  const [cards, setCards] = useState(null);
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    if (!usuario) return;
    buscarLista("/cards")
      .then(setCards)
      .catch(() => {
        setCards([]);
        setMensagem({ tipo: "erro", texto: "Não foi possível carregar as recomendações." });
      });
  }, [usuario]);

  useEffect(() => {
    if (erroOpcoes) setMensagem({ tipo: "erro", texto: "Não foi possível carregar os filtros." });
  }, [erroOpcoes]);

  const encontrados = useMemo(() => {
    if (!cards) return [];
    const termo = semAcentos(filtros.busca.trim());
    return cards.filter(
      (card) =>
        (semAcentos(card.titulo).includes(termo) || semAcentos(card.descricao).includes(termo)) &&
        (!filtros.tipoId || card.tipo_id === Number(filtros.tipoId)) &&
        (!filtros.categoriaId || card.categoria_id === Number(filtros.categoriaId)) &&
        (!filtros.nivelId || card.nivel_id === Number(filtros.nivelId)) &&
        (!filtros.idioma || card.idioma === filtros.idioma),
    );
  }, [cards, filtros]);

  function alterarFiltro(evento) {
    setFiltros({ ...filtros, [evento.target.name]: evento.target.value });
  }

  async function excluir(card) {
    if (!window.confirm(`Excluir ${card.titulo}? Esta ação não poderá ser desfeita`)) return;
    try {
      const { ok, status, dados } = await requisitar(`/admin/cards/${card.id}`, { metodo: "DELETE" });
      if (status === 401) return;
      if (ok) {
        setCards((atuais) => atuais.filter((item) => item.id !== card.id));
        setMensagem({ tipo: "sucesso", texto: dados.message });
      } else {
        setMensagem({ tipo: "erro", texto: dados?.error ?? "Não foi possível excluir." });
      }
    } catch (e) {
      setMensagem({
        tipo: "erro",
        texto: e instanceof SemConexao ? e.message : "Não foi possível excluir a recomendação. Tente novamente.",
      });
    }
  }

  let linhas;
  if (!cards) linhas = <LinhaUnica texto="Carregando..." />;
  else if (encontrados.length === 0)
    linhas = (
      <LinhaUnica
        texto={cards.length === 0 ? "Nenhuma recomendação cadastrada." : "Nenhuma recomendação encontrada."}
      />
    );
  else
    linhas = encontrados.map((card) => (
      <tr key={card.id}>
        <td>
          <a href={card.url} target="_blank" rel="noopener noreferrer">
            {card.titulo}
          </a>
        </td>
        <td>{classificacao(card)}</td>
        <td>{nomesDasTags(card)}</td>
        <td>{formatarData(card.data_envio)}</td>
        <td>
          <Link to={`/painel/editar/${card.id}`}>Editar</Link>{" "}
          <button type="button" onClick={() => excluir(card)}>
            Excluir
          </button>
        </td>
      </tr>
    ));

  return (
    <>
      <Cabecalho area="admin" />
      <p id="aviso_sessao">{erroSessao}</p>

      {usuario && (
        <main id="conteudo">
          <h1>Área administrativa</h1>
          <p>Olá, {usuario.nome}</p>

          {usuario.papel === "professor" && <Link to="/contas">Gerenciar contas</Link>}
          <Link to="/">Ir para o catálogo</Link>

          <h1>Painel administrativo</h1>
          <p>Gerencie as recomendações deste repositório</p>

          <Link to="/painel/nova">Criar recomendação</Link>

          <Mensagem mensagem={mensagem} />

          <form id="filtros" onSubmit={(e) => e.preventDefault()}>
            <label>
              Buscar pelo título ou descrição
              <input
                type="search"
                id="busca"
                name="busca"
                placeholder="Ex.: kanji"
                value={filtros.busca}
                onChange={alterarFiltro}
              />
            </label>

            <label>
              Tipo
              <select id="filtro_tipo" name="tipoId" value={filtros.tipoId} onChange={alterarFiltro}>
                <option value="">Todos</option>
                <Opcoes itens={tipos} />
              </select>
            </label>

            <label>
              Categoria
              <select id="filtro_categoria" name="categoriaId" value={filtros.categoriaId} onChange={alterarFiltro}>
                <option value="">Todas</option>
                <Opcoes itens={categorias} />
              </select>
            </label>

            <label>
              Nível
              <select id="filtro_nivel" name="nivelId" value={filtros.nivelId} onChange={alterarFiltro}>
                <option value="">Todos</option>
                <Opcoes itens={niveis} />
              </select>
            </label>

            <label>
              Idioma
              <select id="filtro_idioma" name="idioma" value={filtros.idioma} onChange={alterarFiltro}>
                <option value="">Todos</option>
                {IDIOMAS.map((idioma) => (
                  <option key={idioma} value={idioma}>
                    {idioma}
                  </option>
                ))}
              </select>
            </label>

            <button type="button" id="limpar_filtros" onClick={() => setFiltros(FILTROS_VAZIOS)}>
              Limpar
            </button>
          </form>

          <table>
            <thead>
              <tr>
                <th>Recomendação</th>
                <th>Classificação</th>
                <th>Tags</th>
                <th>Publicada em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody id="tabela_cards">{linhas}</tbody>
          </table>
        </main>
      )}
    </>
  );
}

function LinhaUnica({ texto }) {
  return (
    <tr>
      <td colSpan={5}>{texto}</td>
    </tr>
  );
}
