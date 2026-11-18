import { useCallback, useEffect, useState } from "react";
import { requisitar, SemConexao } from "../api.js";
import Cabecalho from "../componentes/Cabecalho.jsx";
import Mensagem from "../componentes/Mensagem.jsx";
import { useTitulo } from "../hooks/useTitulo.js";
import { Link } from "../roteador.jsx";

const NOVA_CONTA = { nome: "", email: "", papel: "bolsista" };

export default function Contas() {
  useTitulo("Gerenciar contas");
  const [contas, setContas] = useState(null);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "Carregando..." });
  const [formulario, setFormulario] = useState(NOVA_CONTA);
  const [senhaCriada, setSenhaCriada] = useState(null); // { nome, senha }

  const carregar = useCallback(async () => {
    try {
      const { ok, status, dados } = await requisitar("/admin/contas");
      if (status === 401) return;
      if (status === 403) {
        setMensagem({ tipo: "erro", texto: "Acesso permitido apenas ao professor." });
        return;
      }
      if (!ok) throw new Error();
      setContas(dados);
      setMensagem((atual) => (atual?.texto === "Carregando..." ? null : atual));
    } catch {
      setMensagem({ tipo: "erro", texto: "Não foi possível carregar as contas." });
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function erroDeConexao(e) {
    setMensagem({ tipo: "erro", texto: e instanceof SemConexao ? e.message : "Algo deu errado. Tente novamente." });
  }

  async function criar(evento) {
    evento.preventDefault();
    setMensagem(null);
    setSenhaCriada(null);
    const nome = formulario.nome.trim();
    try {
      const { ok, status, dados } = await requisitar("/admin/contas", {
        metodo: "POST",
        corpo: { ...formulario, nome },
      });
      if (status === 401) return;
      if (ok) {
        setSenhaCriada({ nome, senha: dados.senhaProvisoria });
        setFormulario(NOVA_CONTA);
        await carregar();
      } else {
        setMensagem({ tipo: "erro", texto: dados?.error ?? "Não foi possível criar a conta." });
      }
    } catch (e) {
      erroDeConexao(e);
    }
  }

  async function desativar(conta) {
    if (!window.confirm(`Desativar a conta de ${conta.nome}? Ela não conseguirá mais entrar.`)) return;
    try {
      const { ok, status, dados } = await requisitar(`/admin/contas/${conta.id}/desativar`, { metodo: "PATCH" });
      if (status === 401) return;
      setMensagem({ tipo: ok ? "sucesso" : "erro", texto: ok ? dados.message : dados?.error });
      if (ok) await carregar();
    } catch (e) {
      erroDeConexao(e);
    }
  }

  async function redefinirSenha(conta) {
    if (!window.confirm(`Redefinir a senha de ${conta.nome}? A senha atual deixará de funcionar.`)) return;
    try {
      const { ok, status, dados } = await requisitar(`/admin/contas/${conta.id}/redefinir_senha`, {
        metodo: "PATCH",
      });
      if (status === 401) return;
      if (ok) {
        setSenhaCriada({ nome: conta.nome, senha: dados.senhaProvisoria });
        setMensagem({ tipo: "sucesso", texto: dados.message });
      } else {
        setMensagem({ tipo: "erro", texto: dados?.error });
      }
    } catch (e) {
      erroDeConexao(e);
    }
  }

  function alterar(evento) {
    setFormulario({ ...formulario, [evento.target.name]: evento.target.value });
  }

  return (
    <>
      <Cabecalho area="admin" />
      <Link to="/painel">Voltar ao painel</Link>
      <h1>Gerenciar contas</h1>

      <Mensagem mensagem={mensagem} />

      {contas && (
        <section id="area_contas">
          <h2>Nova conta</h2>
          <form id="formulario_conta" onSubmit={criar}>
            <label>
              Nome *
              <input type="text" name="nome" required maxLength={100} value={formulario.nome} onChange={alterar} />
            </label>
            <label>
              E-mail *
              <input type="email" name="email" required maxLength={255} value={formulario.email} onChange={alterar} />
            </label>
            <label>
              Papel *
              <select name="papel" required value={formulario.papel} onChange={alterar}>
                <option value="bolsista">Bolsista</option>
                <option value="professor">Professor</option>
              </select>
            </label>
            <button type="submit">Criar conta</button>
          </form>

          {senhaCriada && (
            <div id="senha_criada">
              <p>
                <strong>Senha provisória de {senhaCriada.nome}:</strong> <code>{senhaCriada.senha}</code>
              </p>
              <p>Anote e entregue por um canal seguro. Ela não será mostrada de novo.</p>
            </div>
          )}

          <h2>Contas</h2>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Papel</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody id="tabela_contas">
              {contas.map((conta) => (
                <tr key={conta.id}>
                  <td>{conta.nome}</td>
                  <td>{conta.email}</td>
                  <td>{conta.papel === "professor" ? "Professor" : "Bolsista"}</td>
                  <td>{conta.ativo ? "Ativa" : "Desativada"}</td>
                  <td>
                    {conta.ativo && (
                      <>
                        <button type="button" onClick={() => desativar(conta)}>
                          Desativar
                        </button>{" "}
                        <button type="button" onClick={() => redefinirSenha(conta)}>
                          Redefinir senha
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
