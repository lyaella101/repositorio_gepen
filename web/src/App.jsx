import { useEffect } from "react";
import Catalogo from "./paginas/Catalogo.jsx";
import Contas from "./paginas/Contas.jsx";
import EditarRecomendacao from "./paginas/EditarRecomendacao.jsx";
import Login from "./paginas/Login.jsx";
import NaoEncontrada from "./paginas/NaoEncontrada.jsx";
import NovaRecomendacao from "./paginas/NovaRecomendacao.jsx";
import Painel from "./paginas/Painel.jsx";
import Senha from "./paginas/Senha.jsx";
import { combinar, navegar, useLocalizacao } from "./roteador.jsx";

// Endereço → tela.
const ROTAS = [
  { caminho: "/", tela: Catalogo },
  { caminho: "/entrar", tela: Login },
  { caminho: "/painel", tela: Painel },
  { caminho: "/painel/nova", tela: NovaRecomendacao },
  { caminho: "/painel/editar/:id", tela: EditarRecomendacao },
  { caminho: "/contas", tela: Contas },
  { caminho: "/senha", tela: Senha },
];

// Endereços da versão antiga (HTML puro), para links salvos continuarem funcionando.
const ENDERECOS_ANTIGOS = {
  "/index.html": "/",
  "/login.html": "/entrar",
  "/admin.html": "/painel",
  "/novo_card.html": "/painel/nova",
  "/contas.html": "/contas",
  "/senha.html": "/senha",
};

function enderecoAntigo(caminho, busca) {
  if (caminho === "/editar_card.html") {
    const id = new URLSearchParams(busca).get("id");
    return id ? `/painel/editar/${id}` : "/painel";
  }
  return ENDERECOS_ANTIGOS[caminho];
}

export default function App() {
  const { caminho, busca } = useLocalizacao();
  const novoEndereco = enderecoAntigo(caminho, busca);

  useEffect(() => {
    if (novoEndereco) navegar(novoEndereco, { substituir: true });
  }, [novoEndereco]);

  if (novoEndereco) return null;

  for (const rota of ROTAS) {
    const parametros = combinar(rota.caminho, caminho);
    if (parametros) {
      const Tela = rota.tela;
      // "key" recria a tela ao trocar de endereço (ex.: editar outra recomendação).
      return <Tela key={caminho} {...parametros} />;
    }
  }
  return <NaoEncontrada />;
}
