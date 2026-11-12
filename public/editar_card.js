const formulario = document.getElementById("formulario_card");
const campoTipo = document.getElementById("campo_tipo");
const campoCategoria = document.getElementById("campo_categoria");
const campoNivel = document.getElementById("campo_nivel");
const listaTags = document.getElementById("lista_tags");
const mensagem = document.getElementById("mensagem");
const cardId = Number(new URLSearchParams(window.location.search).get("id"));

async function verificarSessao() {
  const resposta = await fetch("/admin/eu");
  if (resposta.status === 401) {
    window.location.href = "/login.html";
  }
}

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

async function iniciar() {
  await verificarSessao();

  if (!Number.isInteger(cardId) || cardId < 1) {
    mensagem.textContent = "Recomendação inválida.";
    return;
  }

  try {
    await Promise.all([
      preencherLista(campoTipo, "/tipos"),
      preencherLista(campoCategoria, "/categorias"),
      preencherLista(campoNivel, "/niveis"),
    ]);

    const resposta = await fetch(`/admin/cards/${cardId}`);

    if (resposta.status === 404) {
      mensagem.textContent = "Esta recomendação não existe ou já foi excluída";
      return;
    }

    const card = await resposta.json();

    formulario.titulo.value = card.titulo;
    formulario.descricao.value = card.descricao;
    formulario.url.value = card.url;
    formulario.tipoId.value = card.tipo_id;
    formulario.categoriaId.value = card.categoria_id;
    formulario.nivelId.value = card.nivel_id;
    formulario.idioma.value = card.idioma;
    formulario.imagemUrl.value = card.imagem_url ?? "";
    formulario.observacoes.value = card.observacoes ?? "";

    await carregarTags(card.categoria_id, card.tags);

    mensagem.textContent = "";
    formulario.hidden = false;
  } catch (error) {
    mensagem.textContent = "Não foi possível carregar a recomendação";
  }
}

async function carregarTags(categoriaId, tagsMarcadas = []) {
  listaTags.textContent = "";

  if (!categoriaId) {
    listaTags.textContent = "Escolha uma categoria para ver as tags";
    return;
  }

  try {
    const resposta = await fetch(`/categorias/${categoriaId}/tags`);
    const tags = await resposta.json();

    if (tags.length === 0) {
      listaTags.textContent = "Esta categoria ainda não tem tags";
      return;
    }

    for (const tag of tags) {
      const rotulo = document.createElement("label");
      const caixa = document.createElement("input");
      caixa.type = "checkbox";
      caixa.name = "tags";
      caixa.value = tag.id;
      caixa.checked = tagsMarcadas.includes(tag.id);
      rotulo.appendChild(caixa);
      rotulo.append(" " + tag.nome);
      listaTags.appendChild(rotulo);
    }
  } catch (error) {
    listaTags.textContent = "Não foi possível carregar as tags";
  }
}

campoCategoria.addEventListener("change", () => {
  carregarTags(campoCategoria.value);
});

formulario.addEventListener("submit", async (event) => {
  event.preventDefault();
  mensagem.textContent = "";

  const tagsMarcadas = [
    ...formulario.querySelectorAll('input[name="tags"]:checked'),
  ].map((caixa) => Number(caixa.value));

  if (tagsMarcadas.length === 0) {
    mensagem.style.color = "red";
    mensagem.textContent = "Escolha pelo menos uma tag";
    return;
  }

  const dadosCard = {
    titulo: formulario.titulo.value,
    descricao: formulario.descricao.value,
    url: formulario.url.value,
    tipoId: Number(formulario.tipoId.value),
    categoriaId: Number(formulario.categoriaId.value),
    nivelId: Number(formulario.nivelId.value),
    idioma: formulario.idioma.value,
    imagemUrl: formulario.imagemUrl.value,
    observacoes: formulario.observacoes.value,
    tags: tagsMarcadas,
  };

  try {
    const resposta = await fetch(`/admin/cards/${cardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosCard),
    });

    if (resposta.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    const dados = await resposta.json();

    if (resposta.ok) {
      mensagem.style.color = "green";
      mensagem.textContent = dados.message;
    } else {
      mensagem.style.color = "red";
      mensagem.textContent = dados.error;
    }
  } catch (error) {
    mensagem.style.color = "red";
    mensagem.textContent = "Não foi possível conectar. Tente novamente.";
  }
});

iniciar();
