const formulario = document.getElementById("formulario-senha");
const mensagemErro = document.getElementById("error-message");

formulario.addEventListener("submit", async (event) => {
  event.preventDefault();

  mensagemErro.textContent = "";

  const senhaAtual = formulario.senhaAtual.value;
  const novaSenha = formulario.novaSenha.value;
  const confirmarNovaSenha = formulario.confirmarNovaSenha.value;

  try {
    const resposta = await fetch("/admin/senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senhaAtual, novaSenha, confirmarNovaSenha }),
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      mensagemErro.style.color = "green";
      mensagemErro.textContent = dados.message;
      formulario.reset();
    } else {
      mensagemErro.style.color = "red";
      mensagemErro.textContent = dados.error;
    }
  } catch (error) {
    mensagemErro.style.color = "red";
    mensagemErro.textContent = "Não foi possível conectar. Tente novamente.";
  }
});
