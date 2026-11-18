const formulario = document.getElementById("formulario-login");
const mensagemErro = document.getElementById("error-message");

formulario.addEventListener("submit", async (event) => {
  event.preventDefault();

  mensagemErro.textContent = "";

  const email = formulario.email.value;
  const senha = formulario.senha.value;

  try {
    const resposta = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      window.location.href = "/admin.html";
    } else {
      mensagemErro.textContent = dados.error;
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    mensagemErro.textContent =
      "Não foi possível conectar ao servidor. Tente novamente.";
  }
});

async function redirecionarSeLogado() {
  try {
    const resposta = await fetch("/admin/eu");
    if (resposta.ok) {
      window.location.href = "/admin.html";
    }
  } catch (error) {}
}

redirecionarSeLogado();
