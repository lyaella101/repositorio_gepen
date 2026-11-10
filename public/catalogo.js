const listaCards = document.getElementById("lista_cards");
const contagem = document.getElementById("contagem");

async function carregarCatalogo() {
  try {
    const resposta = await fetch("/cards");
    const cards = await resposta.json();

    listaCards.textContent = "";

    if (cards.length === 0) {
      listaCards.textContent = "Nenhuma recomendação cadastrada ainda.";
      return;
    }

    contagem.textContent = `${cards.length} recomendações - mais recentes primeiro`;

    for (const card of cards) {
      listaCards.appendChild(criarCard(card));
    }
  } catch (error) {
    listaCards.textContent =
      "Não foi possível carregar o catálogo. Tente novamente";
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

carregarCatalogo();
