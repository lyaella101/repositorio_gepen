const formulario = document.getElementById("formulario_card");
const campoTipo = document.getElementById("campo_tipo");
const campoCategoria = document.getElementById("campo_categoria");
const campoNivel = document.getElementById("campo_nivel");
const listaTags = document.getElementById("lista_tags");
const mensagem = document.getElementById("mensagem");

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

  try {
    await Promise.all([
      preencherLista(campoTipo, "/tipos"),
      preencherLista(campoCategoria, "/categorias"),
      preencherLista(campoNivel, "/niveis"),
    ]);
  } catch (error) {
    mensagem.textContent =
      "Não foi possível carregar o formulário. Recarregue a página e tente novamente.";
  }
}

campoCategoria.addEventListener("change", async () => {
  listaTags.textContent = "";

  const categoriaId = campoCategoria.value;
  if (!categoriaId) {
    listaTags.textContent = "Escolha uma categoria para ver as tags.";
    return;
  }

  try {
    const resposta = await fetch(`/categorias/${categoriaId}/tags`);
    const tags = await resposta.json();

    if (tags.length === 0) {
      listaTags.textContent = "Esta categoria ainda não tem tags.";
      return;
    }

    for (const tag of tags) {
      const rotulo = document.createElement("label");

      const caixa = document.createElement("input");
      caixa.type = "checkbox";
      caixa.name = "tags";
      caixa.value = tag.id;

      rotulo.appendChild(caixa);
      rotulo.append(" " + tag.nome);

      listaTags.appendChild(rotulo);
    }
  } catch (error) {
    listaTags.textContent = "Não foi possível carregar as tags.";
  }
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
    observacoes: formulario.observacoes.value,
    tags: tagsMarcadas,
  };

  try {
    const resposta = await fetch("/admin/cards", {
      method: "POST",
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
      formulario.reset();
      listaTags.textContent = "Escolha uma categoria para ver as tags.";
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
