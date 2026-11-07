const nomeUsuario = document.getElementById("nome_usuario");

async function verificarSessao() {
  try {
    const resposta = await fetch("/admin/eu");

    if (resposta.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    const dados = await resposta.json();
    nomeUsuario.textContent = dados.nome;
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
    nomeUsuario.textContent = "(não foi possível carregar)";
  }
}

verificarSessao();