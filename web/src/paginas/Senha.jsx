import { useState } from "react";
import { requisitar, SemConexao } from "../api.js";
import Cabecalho from "../componentes/Cabecalho.jsx";
import Mensagem from "../componentes/Mensagem.jsx";
import { useSessao } from "../hooks/useSessao.js";
import { useTitulo } from "../hooks/useTitulo.js";
import { Link } from "../roteador.jsx";

const VAZIO = { senhaAtual: "", novaSenha: "", confirmarNovaSenha: "" };

export default function Senha() {
  useTitulo("Alterar senha");
  useSessao(); // sem login, vai para /entrar
  const [campos, setCampos] = useState(VAZIO);
  const [mensagem, setMensagem] = useState(null);

  function alterar(evento) {
    setCampos({ ...campos, [evento.target.name]: evento.target.value });
  }

  async function salvar(evento) {
    evento.preventDefault();
    setMensagem(null);
    try {
      const { ok, status, dados } = await requisitar("/admin/senha", { metodo: "POST", corpo: campos });
      if (status === 401) return;
      if (ok) {
        setMensagem({ tipo: "sucesso", texto: dados.message });
        setCampos(VAZIO);
      } else {
        setMensagem({ tipo: "erro", texto: dados?.error ?? "Não foi possível alterar a senha." });
      }
    } catch (e) {
      setMensagem({ tipo: "erro", texto: e instanceof SemConexao ? e.message : "Erro ao alterar a senha." });
    }
  }

  return (
    <>
      <Cabecalho area="admin" />
      <form id="formulario_senha" onSubmit={salvar}>
        <label>
          Senha atual
          <input type="password" name="senhaAtual" required autoComplete="current-password" value={campos.senhaAtual} onChange={alterar} />
        </label>
        <label>
          Nova senha
          <input
            type="password"
            name="novaSenha"
            required
            minLength={8}
            maxLength={64}
            autoComplete="new-password"
            value={campos.novaSenha}
            onChange={alterar}
          />
        </label>
        <label>
          Confirmar nova senha
          <input
            type="password"
            name="confirmarNovaSenha"
            required
            autoComplete="new-password"
            value={campos.confirmarNovaSenha}
            onChange={alterar}
          />
        </label>
        <button type="submit">Salvar nova senha</button>
      </form>
      <Mensagem id="error_message" mensagem={mensagem} />

      <Link to="/painel">Voltar ao painel</Link>
    </>
  );
}
