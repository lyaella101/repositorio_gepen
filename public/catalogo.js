const listaCards = document.getElementById("lista_cards");
const contagem = document.getElementById("contagem");
const campoBusca = document.getElementById("busca");
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

  contagem.textContent = `${cards.length} recomendações (Mais recente)`;

  for (const card of cards) {
    listaCards.appendChild(criarCard(card));
  }
}

function criarCard(card) {
  const bloco = document.createElement("article");

  if (card.imagem_url) {
    const imagem = document.createElement("img");
    imagem.src = card.imagem_url;
    imagem.alt = `Capa de ${card.titulo}`;
    imagem.width = 240;
    bloco.appendChild(imagem);
  }

  const titulo = document.createElement("h2");
  const link = document.createElement("a");
  link.href = card.url;
  link.textContent = card.titulo;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  titulo.appendChild(link);
  bloco.appendChild(titulo);

  const classificacao = document.createElement("p");
  classificacao.textContent = `${card.tipo} · ${card.categoria} · ${card.nivel}`;
  bloco.appendChild(classificacao);

  const idioma = document.createElement("p");
  idioma.textContent = `Idioma: ${card.idioma}`;
  bloco.appendChild(idioma);

  const data = document.createElement("p");
  data.textContent = `Publicado em: ${new Date(card.data_envio).toLocaleDateString("pt-BR")}`;
  bloco.appendChild(data);

  const descricao = document.createElement("p");
  descricao.textContent = `Sobre: ${card.descricao}`;
  bloco.appendChild(descricao);

  const paragrafoTags = document.createElement("p");
  paragrafoTags.textContent = `Tags: ${card.tags.map((tag) => tag.nome).join(", ")}`;
  bloco.appendChild(paragrafoTags);

  return bloco;
}

function semAcentos(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function buscar() {
  const termo = semAcentos(campoBusca.value.trim());

  const encontrados = todosOsCards.filter((card) =>
    semAcentos(card.titulo).includes(termo),
  );

  mostrarCards(encontrados);
}

campoBusca.addEventListener("input", buscar);

carregarCatalogo();
