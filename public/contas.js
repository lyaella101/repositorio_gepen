const mensagem = document.getElementById("mensagem");
const areaContas = document.getElementById("area_contas");
const formulario = document.getElementById("formulario_conta");
const senhaCriada = document.getElementById("senha_criada");
const senhaValor = document.getElementById("senha_valor");
const tabelaContas = document.getElementById("tabela_contas");

async function verificarAcesso() {
  const resposta = await fetch("/admin/contas");

  if (resposta.status === 401) {
    window.location.href = "/login.html";
    return null;
  }
  if (resposta.status === 403) {
    mensagem.textContent = "Acesso permitido apenas ao professor.";
    return null;
  }

  return await resposta.json();
}

function mostrarContas(contas) {
  tabelaContas.textContent = "";

  for (const conta of contas) {
    const linha = document.createElement("tr");

    linha.insertCell().textContent = conta.nome;
    linha.insertCell().textContent = conta.email;
    linha.insertCell().textContent =
      conta.papel === "professor" ? "Professor" : "Bolsista";
    linha.insertCell().textContent = conta.ativo ? "Ativa" : "Desativada";

    const acoes = linha.insertCell();

    if (conta.ativo) {
      const botaoDesativar = document.createElement("button");
      botaoDesativar.type = "button";
      botaoDesativar.textContent = "Desativar";
      botaoDesativar.addEventListener("click", () => desativarConta(conta));
      acoes.appendChild(botaoDesativar);
      acoes.append(" ");
      const botaoRedefinir = document.createElement("button");
      botaoRedefinir.type = "button";
      botaoRedefinir.textContent = "Redefinir senha";
      botaoRedefinir.addEventListener("click", () => redefinirSenha(conta));
      acoes.appendChild(botaoRedefinir);
    }

    tabelaContas.appendChild(linha);
  }
}

formulario.addEventListener("submit", async (event) => {
  event.preventDefault();
  mensagem.textContent = "";
  senhaCriada.hidden = true;

  const dadosConta = {
    nome: formulario.nome.value,
    email: formulario.email.value,
    papel: formulario.papel.value,
  };

  try {
    const resposta = await fetch("/admin/contas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosConta),
    });

    if (resposta.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    const dados = await resposta.json();

    if (resposta.ok) {
      mensagem.style.color = "green";
      mensagem.textContent = dados.message;
      senhaValor.textContent = dados.senhaProvisoria;
      senhaCriada.hidden = false;
      formulario.reset();
      await atualizarTabela();
    } else {
      mensagem.style.color = "red";
      mensagem.textContent = dados.error;
    }
  } catch (error) {
    mensagem.style.color = "red";
    mensagem.textContent = "Não foi possível conectar. Tente novamente.";
  }
});

async function desativarConta(conta) {
  if (
    !confirm(
      `Desativar a conta de ${conta.nome}? Ela não conseguirá mais entrar.`,
    )
  ) {
    return;
  }

  try {
    const resposta = await fetch(`/admin/contas/${conta.id}/desativar`, {
      method: "PATCH",
    });

    if (resposta.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    const dados = await resposta.json();

    if (resposta.ok) {
      mensagem.style.color = "green";
      mensagem.textContent = dados.message;
      await atualizarTabela();
    } else {
      mensagem.style.color = "red";
      mensagem.textContent = dados.error;
    }
  } catch (error) {
    mensagem.style.color = "red";
    mensagem.textContent = "Não foi possível conectar. Tente novamente.";
  }
}

async function redefinirSenha(conta) {
  if (
    !confirm(
      `Redefinir a senha de ${conta.nome}? A senha atual deixará de funcionar.`,
    )
  ) {
    return;
  }

  try {
    const resposta = await fetch(`/admin/contas/${conta.id}/redefinir_senha`, {
      method: "PATCH",
    });

    if (resposta.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    const dados = await resposta.json();

    if (resposta.ok) {
      senhaCriada.textContent =
        `Nova senha provisória de ${conta.nome}: ${dados.senhaProvisoria} ` +
        " " +
        "Anote agora: ela não será mostrada de novo.";
      senhaCriada.hidden = false;
      mensagem.style.color = "green";
      mensagem.textContent = dados.message;
    } else {
      mensagem.style.color = "red";
      mensagem.textContent = dados.error;
    }
  } catch (error) {
    mensagem.style.color = "red";
    mensagem.textContent =
      "Não foi possível redefinir a senha. Tente novamente.";
  }
}

async function atualizarTabela() {
  const contas = await verificarAcesso();
  if (contas) {
    mostrarContas(contas);
  }
}

async function iniciar() {
  const contas = await verificarAcesso();
  if (!contas) {
    return;
  }
  mensagem.textContent = "";
  areaContas.hidden = false;
  mostrarContas(contas);
}

iniciar();
