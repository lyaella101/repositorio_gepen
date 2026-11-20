import { useEffect, useMemo, useRef, useState } from "react";
import { buscarLista } from "../api.js";
import Cabecalho from "../componentes/Cabecalho.jsx";
import ListaTags from "../componentes/ListaTags.jsx";
import Opcoes from "../componentes/Opcoes.jsx";
import { useOpcoes, useTagsDaCategoria } from "../hooks/useOpcoes.js";
import { useTitulo } from "../hooks/useTitulo.js";
import { Link } from "../roteador.jsx";
import {
  classificacao,
  formatarData,
  IDIOMAS,
  nomesDasTags,
  semAcentos,
} from "../util.js";

const FILTROS_VAZIOS = {
  tipoId: "",
  categoriaId: "",
  nivelId: "",
  idioma: "",
  tags: [],
};

export default function Catalogo() {
  useTitulo("Repositório de recomendações da GEPEN");
  const { tipos, categorias, niveis } = useOpcoes();
  const [cards, setCards] = useState(null); // null = carregando
  const [erro, setErro] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [selecionado, setSelecionado] = useState(null);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const tagsDaCategoria = useTagsDaCategoria(filtros.categoriaId);

  useEffect(() => {
    buscarLista("/cards")
      .then(setCards)
      .catch(() => setErro(true));
  }, []);

  const visiveis = useMemo(() => {
    if (!cards) return [];
    const termo = semAcentos(busca.trim());
    return cards.filter(
      (card) =>
        (semAcentos(card.titulo).includes(termo) ||
          semAcentos(card.descricao).includes(termo)) &&
        (!filtros.tipoId || card.tipo_id === Number(filtros.tipoId)) &&
        (!filtros.categoriaId ||
          card.categoria_id === Number(filtros.categoriaId)) &&
        (!filtros.nivelId || card.nivel_id === Number(filtros.nivelId)) &&
        (!filtros.idioma || card.idioma === filtros.idioma) &&
        filtros.tags.every((id) => card.tags.some((tag) => tag.id === id)),
    );
  }, [cards, busca, filtros]);

  function alterarFiltro(evento) {
    const { name, value } = evento.target;
    setFiltros((atual) =>
      name === "categoriaId"
        ? { ...atual, categoriaId: value, tags: [] }
        : { ...atual, [name]: value },
    );
  }

  function limpar() {
    setFiltros(FILTROS_VAZIOS);
    setBusca("");
  }

  let lista;
  if (erro) lista = "Não foi possível carregar o catálogo. Tente novamente.";
  else if (!cards) lista = "Carregando...";
  else if (visiveis.length === 0)
    lista =
      cards.length === 0
        ? "Nenhuma recomendação cadastrada ainda."
        : "Nenhuma recomendação encontrada.";
  else
    lista = visiveis.map((card) => (
      <CardRecomendacao key={card.id} card={card} aoAbrir={setSelecionado} />
    ));

  const contagem =
    cards && visiveis.length > 0
      ? `${visiveis.length} ${visiveis.length === 1 ? "recomendação" : "recomendações"} (Mais recentes)`
      : "";
  const filtrosAtivos =
    [
      filtros.tipoId,
      filtros.categoriaId,
      filtros.nivelId,
      filtros.idioma,
    ].filter(Boolean).length + filtros.tags.length;
  return (
    <>
      <Cabecalho />
      <h1>Repositório de recomendações</h1>
      <p>Materiais de língua e cultura japonesa indicados pela GEPEN</p>

      <label>
        Buscar por título ou descrição
        <input
          type="search"
          id="busca"
          placeholder="Partículas"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </label>

      <p id="contagem">{contagem}</p>

      <form id="filtros" onSubmit={(e) => e.preventDefault()}>
        <h2>
          <button
            type="button"
            id="botao_filtros"
            aria-expanded={filtrosAbertos}
            onClick={() => setFiltrosAbertos((aberto) => !aberto)}
          >
            Filtros{filtrosAtivos > 0 && ` (${filtrosAtivos})`}
          </button>
        </h2>

        {filtrosAbertos && (
          <>
            <label>
              Tipo de material
              <select
                name="tipoId"
                id="filtro_tipo"
                value={filtros.tipoId}
                onChange={alterarFiltro}
              >
                <option value="">Todos</option>
                <Opcoes itens={tipos} />
              </select>
            </label>

            <label>
              Categoria
              <select
                name="categoriaId"
                id="filtro_categoria"
                value={filtros.categoriaId}
                onChange={alterarFiltro}
              >
                <option value="">Todas</option>
                <Opcoes itens={categorias} />
              </select>
            </label>

            <fieldset>
              <legend>Tags</legend>
              <ListaTags
                id="filtro_tags"
                {...tagsDaCategoria}
                marcadas={filtros.tags}
                aoMudar={(tags) => setFiltros((atual) => ({ ...atual, tags }))}
                semCategoria={!filtros.categoriaId}
                avisoSemCategoria="Escolha uma categoria para ver as tags dela."
              />
            </fieldset>

            <label>
              Nível de aprendizado
              <select
                name="nivelId"
                id="filtro_nivel"
                value={filtros.nivelId}
                onChange={alterarFiltro}
              >
                <option value="">Todos</option>
                <Opcoes itens={niveis} />
              </select>
            </label>

            <label>
              Idioma do material
              <select
                name="idioma"
                value={filtros.idioma}
                onChange={alterarFiltro}
              >
                <option value="">Todos</option>
                {IDIOMAS.map((idioma) => (
                  <option key={idioma}>{idioma}</option>
                ))}
              </select>
            </label>

            <button type="button" id="limpar_filtros" onClick={limpar}>
              Limpar filtros
            </button>
          </>
        )}
      </form>

      <div id="lista_cards">{lista}</div>

      <Detalhes card={selecionado} aoFechar={() => setSelecionado(null)} />

      <footer>
        <Link to="/painel">Acesso da equipe</Link>
      </footer>
    </>
  );
}

function CardRecomendacao({ card, aoAbrir }) {
  return (
    <article onClick={() => aoAbrir(card)}>
      <h2>
        <button type="button">{card.titulo}</button>
      </h2>
      <p>{classificacao(card)}</p>
      <p>Tags: {nomesDasTags(card)}</p>
      <a
        href={card.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        Abrir material
      </a>
    </article>
  );
}

function Detalhes({ card, aoFechar }) {
  const janela = useRef(null);

  useEffect(() => {
    const dialogo = janela.current;
    if (card && !dialogo.open) dialogo.showModal();
    if (!card && dialogo.open) dialogo.close();
  }, [card]);

  return (
    <dialog
      id="detalhes"
      ref={janela}
      onClose={aoFechar}
      onClick={(evento) => {
        if (evento.target === janela.current) janela.current.close();
      }}
    >
      {card && (
        <>
          <button
            type="button"
            id="fechar_detalhes"
            aria-label="Fechar"
            onClick={() => janela.current.close()}
          >
            ✕
          </button>

          <h2 id="detalhes_titulo">{card.titulo}</h2>
          <p id="detalhes_classificacao">{classificacao(card)}</p>
          <p id="detalhes_tags">Tags: {nomesDasTags(card)}</p>

          <h3>Descrição</h3>
          <p id="detalhes_descricao">{card.descricao}</p>

          {card.observacoes && (
            <div id="detalhes_area_observacoes">
              <h3>Observações do professor</h3>
              <p id="detalhes_observacoes">{card.observacoes}</p>
            </div>
          )}

          <p id="detalhes_idioma">Idioma: {card.idioma}</p>
          <p id="detalhes_data">Publicado em {formatarData(card.data_envio)}</p>

          <a
            id="detalhes_link"
            href={card.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir material
          </a>
        </>
      )}
    </dialog>
  );
}
