const listaCards = document.getElementById("lista_cards");
const contagem = document.getElementById("contagem");
const campoBusca = document.getElementById("busca");
const filtros = document.getElementById("filtros");
const filtroTipo = document.getElementById("filtro_tipo");
const filtroCategoria = document.getElementById("filtro_categoria");
const filtroNivel = document.getElementById("filtro_nivel");
const filtroTags = document.getElementById("filtro_tags");
const botaoLimpar = document.getElementById("limpar_filtros");
const janela = document.getElementById("detalhes");

let todosOsCards = [];

async function carregarCatalogo() {
  try {
    const resposta = await fetch("/cards");
    todosOsCards = await resposta.json();
    mostrarCards(todosOsCards);
  } catch (error) {
    listaCards.textContent =
      "Não foi possível carregar o catálogo. Tente novamente.";
  }
}

function mostrarCards(cards) {
  listaCards.textContent = "";

  if (cards.length === 0) {
    contagem.textContent = "";
    listaCards.textContent =
      todosOsCards.length === 0
        ? "Nenhuma recomendação cadastrada ainda."
        : "Nenhuma recomendação encontrada.";
    return;
  }

  const palavra = cards.length === 1 ? "recomendação" : "recomendações";
  contagem.textContent = `${cards.length} ${palavra} (Mais recentes)`;

  for (const card of cards) {
    listaCards.appendChild(criarCard(card));
  }
}

function criarCard(card) {
  const bloco = document.createElement("article");
  bloco.addEventListener("click", () => abrirDetalhes(card));

  const titulo = document.createElement("h2");
  const botaoTitulo = document.createElement("button");
  botaoTitulo.type = "button";
  botaoTitulo.textContent = card.titulo;
  titulo.appendChild(botaoTitulo);
  bloco.appendChild(titulo);

  const classificacao = document.createElement("p");
  classificacao.textContent = `${card.tipo} · ${card.categoria} · ${card.nivel}`;
  bloco.appendChild(classificacao);

  const paragrafoTags = document.createElement("p");
  paragrafoTags.textContent = `Tags: ${card.tags.map((tag) => tag.nome).join(", ")}`;
  bloco.appendChild(paragrafoTags);

  const linkMaterial = document.createElement("a");
  linkMaterial.href = card.url;
  linkMaterial.textContent = "Abrir material";
  linkMaterial.target = "_blank";
  linkMaterial.rel = "noopener noreferrer";
  linkMaterial.addEventListener("click", (event) => event.stopPropagation());
  bloco.appendChild(linkMaterial);

  return bloco;
}

function abrirDetalhes(card) {
  document.getElementById("detalhes_titulo").textContent = card.titulo;
  document.getElementById("detalhes_classificacao").textContent =
    `${card.tipo} · ${card.categoria} · ${card.nivel}`;
  document.getElementById("detalhes_tags").textContent =
    `Tags: ${card.tags.map((tag) => tag.nome).join(", ")}`;
  document.getElementById("detalhes_descricao").textContent = card.descricao;

  document.getElementById("detalhes_area_observacoes").hidden =
    !card.observacoes;
  document.getElementById("detalhes_observacoes").textContent =
    card.observacoes ?? "";

  document.getElementById("detalhes_idioma").textContent =
    `Idioma: ${card.idioma}`;
  document.getElementById("detalhes_data").textContent =
    `Publicado em ${new Date(card.data_envio).toLocaleDateString("pt-BR")}`;
  document.getElementById("detalhes_link").href = card.url;

  janela.showModal();
}

document.getElementById("fechar_detalhes").addEventListener("click", () => {
  janela.close();
});

janela.addEventListener("click", (event) => {
  if (event.target === janela) {
    janela.close();
  }
});

async function preencherLista(campo, endereco) {
  const resposta = await fetch(endereco);
  const itens = await resposta.json();

  for (const item of itens) {
    const opcao = document.createElement("option");
    opcao.value = item.id;
    opcao.textContent = item.nome;
    campo.appendChild(opcao);
  }
}

function semAcentos(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function aplicarFiltros() {
  const termo = semAcentos(campoBusca.value.trim());
  const tipoId = Number(filtros.tipoId.value);
  const categoriaId = Number(filtros.categoriaId.value);
  const nivelId = Number(filtros.nivelId.value);
  const idioma = filtros.idioma.value;
  const tagsMarcadas = [
    ...filtros.querySelectorAll('input[name="tags"]:checked'),
  ].map((caixa) => Number(caixa.value));

  const visiveis = todosOsCards.filter(
    (card) =>
      (semAcentos(card.titulo).includes(termo) || semAcentos(card.descricao).includes(termo)) &&
      (!tipoId || card.tipo_id === tipoId) &&
      (!categoriaId || card.categoria_id === categoriaId) &&
      (!nivelId || card.nivel_id === nivelId) &&
      (!idioma || card.idioma === idioma) &&
      (tagsMarcadas.length === 0 ||
        tagsMarcadas.every((id) => card.tags.some((tag) => tag.id === id))),
  );
  mostrarCards(visiveis);
}

campoBusca.addEventListener("input", aplicarFiltros);
filtros.addEventListener("input", aplicarFiltros);

async function carregarTagsDoFiltro(categoriaId) {
  filtroTags.textContent = "";

  if (!categoriaId) {
    filtroTags.textContent = "Escolha uma categoria para ver as tags dela.";
    return;
  }

  const resposta = await fetch(`/categorias/${categoriaId}/tags`);
  const tags = await resposta.json();

  for (const tag of tags) {
    const rotulo = document.createElement("label");
    const caixa = document.createElement("input");
    caixa.type = "checkbox";
    caixa.name = "tags";
    caixa.value = tag.id;
    rotulo.appendChild(caixa);
    rotulo.append(" " + tag.nome);
    filtroTags.appendChild(rotulo);
  }
}

filtroCategoria.addEventListener("change", async () => {
  await carregarTagsDoFiltro(filtroCategoria.value);
  aplicarFiltros();
});

botaoLimpar.addEventListener("click", () => {
  filtros.reset();
  campoBusca.value = "";
  carregarTagsDoFiltro("");
  mostrarCards(todosOsCards);
});

async function iniciar() {
  await Promise.all([
    preencherLista(filtroTipo, "/tipos"),
    preencherLista(filtroCategoria, "/categorias"),
    preencherLista(filtroNivel, "/niveis"),
  ]);
  await carregarCatalogo();
}

iniciar();
