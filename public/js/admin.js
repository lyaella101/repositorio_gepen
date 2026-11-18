const nomeUsuario = document.getElementById("nome_usuario");
const tabelaCards = document.getElementById("tabela_cards");
const mensagem = document.getElementById("mensagem");
const campoBusca = document.getElementById("busca");
const formFiltros = document.getElementById("filtros");
const filtroTipo = document.getElementById("filtro_tipo");
const filtroCategoria = document.getElementById("filtro_categoria");
const filtroNivel = document.getElementById("filtro_nivel");
const filtroIdioma = document.getElementById("filtro_idioma");
const botaoLimpar = document.getElementById("limpar_filtros");
const conteudo = document.getElementById("conteudo");
const avisoSessao = document.getElementById("aviso_sessao");

let todosOsCards = [];

async function verificarSessao() {
  try {
    const resposta = await fetch("/admin/eu");

    if (resposta.status === 401) {
      window.location.href = "/login.html";
      return false;
    }

    if (!resposta.ok) {
      throw new Error("Resposta inesperada: " + resposta.status);
    }

    const dados = await resposta.json();
    nomeUsuario.textContent = dados.nome;

    if (dados.papel === "professor") {
      document.getElementById("link_contas").hidden = false;
    }

    conteudo.hidden = false; // 3
    return true;
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
    avisoSessao.textContent =
      "Não foi possível carregar o painel. Tente recarregar a página.";
    return false;
  }
}

async function carregarTabela() {
  try {
    const resposta = await fetch("/cards");
    todosOsCards = await resposta.json();
    mostrarTabela(todosOsCards);
  } catch (error) {
    tabelaCards.textContent = "";
    mensagem.textContent = "Não foi possível carregar as recomendações.";
  }
}

function mostrarTabela(cards) {
  tabelaCards.textContent = "";

  if (cards.length === 0) {
    const linha = tabelaCards.insertRow();
    const celula = linha.insertCell();
    celula.colSpan = 5;
    celula.textContent =
      todosOsCards.length === 0
        ? "Nenhuma recomendação cadastrada."
        : "Nenhuma recomendação encontrada.";
    return;
  }

  for (const card of cards) {
    tabelaCards.appendChild(criarLinha(card));
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
  const tipo = filtroTipo.value;
  const categoria = filtroCategoria.value;
  const nivel = filtroNivel.value;
  const idioma = filtroIdioma.value;

  const encontrados = todosOsCards.filter(
    (card) =>
      (semAcentos(card.titulo).includes(termo) ||
        semAcentos(card.descricao).includes(termo)) &&
      (tipo === "" || card.tipo_id === Number(tipo)) &&
      (categoria === "" || card.categoria_id === Number(categoria)) &&
      (nivel === "" || card.nivel_id === Number(nivel)) &&
      (idioma === "" || card.idioma === idioma),
  );

  mostrarTabela(encontrados);
}

async function preencherLista(endereco, select) {
  const resposta = await fetch(endereco);
  const itens = await resposta.json();

  for (const item of itens) {
    const opcao = document.createElement("option");
    opcao.value = item.id;
    opcao.textContent = item.nome;
    select.appendChild(opcao);
  }
}

function criarLinha(card) {
  const linha = document.createElement("tr");

  const celulaTitulo = linha.insertCell();
  const linkMaterial = document.createElement("a");
  linkMaterial.href = card.url;
  linkMaterial.textContent = card.titulo;
  linkMaterial.target = "_blank";
  linkMaterial.rel = "noopener noreferrer";
  celulaTitulo.appendChild(linkMaterial);

  linha.insertCell().textContent = `${card.tipo} · ${card.categoria} · ${card.nivel}`;
  linha.insertCell().textContent = `${card.tags.map((tag) => tag.nome).join(", ")}`;
  linha.insertCell().textContent = new Date(card.data_envio).toLocaleDateString(
    "pt-BR",
  );

  const acoes = linha.insertCell();

  const linkEditar = document.createElement("a");
  linkEditar.href = `/editar_card.html?id=${card.id}`;
  linkEditar.textContent = "Editar";
  acoes.appendChild(linkEditar);

  acoes.append(" ");

  const botaoExcluir = document.createElement("button");
  botaoExcluir.type = "button";
  botaoExcluir.textContent = "Excluir";
  botaoExcluir.addEventListener("click", () => excluirCard(card, linha));
  acoes.appendChild(botaoExcluir);

  return linha;
}

async function excluirCard(card, linha) {
  if (!confirm(`Excluir ${card.titulo}? Esta ação não poderá ser desfeita`))
    return;

  try {
    const resposta = await fetch(`/admin/cards/${card.id}`, {
      method: "DELETE",
    });

    const dados = await resposta.json();

    if (resposta.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    if (resposta.ok) {
      linha.remove();
      todosOsCards = todosOsCards.filter((item) => item.id !== card.id);
      mensagem.style.color = "green";
      mensagem.textContent = dados.message;
    } else {
      mensagem.style.color = "red";
      mensagem.textContent = dados.error;
    }
  } catch (error) {
    mensagem.style.color = "red";
    mensagem.textContent =
      "Não foi possível excluir a recomendação. Tente novamente.";
  }
}

campoBusca.addEventListener("input", aplicarFiltros);
formFiltros.addEventListener("change", aplicarFiltros);

formFiltros.addEventListener("submit", (evento) => {
  evento.preventDefault();
});

botaoLimpar.addEventListener("click", () => {
  formFiltros.reset();
  aplicarFiltros();
});

async function iniciar() {
  const logado = await verificarSessao();
  if (!logado) return;

  try {
    await Promise.all([
      preencherLista("/tipos", filtroTipo),
      preencherLista("/categorias", filtroCategoria),
      preencherLista("/niveis", filtroNivel),
    ]);
  } catch (error) {
    mensagem.textContent = "Não foi possível carregar os filtros.";
  }

  carregarTabela();
}

iniciar();
