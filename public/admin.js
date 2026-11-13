const nomeUsuario = document.getElementById("nome_usuario");
const tabelaCards = document.getElementById("tabela_cards");
const mensagem = document.getElementById("mensagem");
const campoBusca = document.getElementById("busca");

let todosOsCards = [];

async function verificarSessao() {
  try {
    const resposta = await fetch("/admin/eu");

    if (resposta.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    const dados = await resposta.json();
    nomeUsuario.textContent = dados.nome;

    if (dados.papel === "professor") {
      document.getElementById("link_contas").hidden = false;
    }
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
    nomeUsuario.textContent = "(não foi possível carregar)";
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

function buscar() {
  const termo = semAcentos(campoBusca.value.trim());
  const encontrados = todosOsCards.filter((card) =>
    semAcentos(card.titulo).includes(termo),
  );
  mostrarTabela(encontrados);
}

campoBusca.addEventListener("input", buscar);

function criarLinha(card) {
  const linha = document.createElement("tr");

  const celulaTitulo = linha.insertCell();
  const linkMaterial = document.createElement("a");
  linkMaterial.href = card.url;
  linkMaterial.textContent = card.titulo;
  linkMaterial.target = "_blank";
  linkMaterial.rel = "noopener noreferrer";
  celulaTitulo.appendChild(linkMaterial);

  linha.insertCell().textContent = `${card.titulo} · ${card.categoria} · ${card.nivel}`;
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
      window.location.href("/login.html");
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
    mensagemErro.style.color = "red";
    mensagemErro.textContent =
      "Não foi possível excluir a recomendação. Tente novamente.";
  }
}

verificarSessao().then(carregarTabela);
