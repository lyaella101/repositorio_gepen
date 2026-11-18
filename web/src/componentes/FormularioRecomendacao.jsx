import { useState } from "react";
import { useOpcoes, useTagsDaCategoria } from "../hooks/useOpcoes.js";
import { IDIOMAS } from "../util.js";
import ListaTags from "./ListaTags.jsx";
import Opcoes from "./Opcoes.jsx";

export const RECOMENDACAO_VAZIA = {
  titulo: "",
  descricao: "",
  url: "",
  tipoId: "",
  categoriaId: "",
  nivelId: "",
  idioma: "",
  observacoes: "",
  tags: [],
};

// Formulário usado em "Nova recomendação" e "Editar recomendação".
// "aoSalvar" recebe os dados prontos para enviar ao servidor.
export default function FormularioRecomendacao({ inicial = RECOMENDACAO_VAZIA, aoSalvar, aoErro }) {
  const { tipos, categorias, niveis, erro: erroOpcoes } = useOpcoes();
  const [dados, setDados] = useState(inicial);
  const [enviando, setEnviando] = useState(false);
  const tagsDaCategoria = useTagsDaCategoria(dados.categoriaId);

  function alterar(evento) {
    const { name, value } = evento.target;
    setDados((atual) =>
      name === "categoriaId"
        ? { ...atual, categoriaId: value, tags: [] } // tags dependem da categoria
        : { ...atual, [name]: value },
    );
  }

  async function enviar(evento) {
    evento.preventDefault();

    if (dados.tags.length === 0) {
      aoErro("Escolha pelo menos uma tag");
      return;
    }

    setEnviando(true);
    const limpou = await aoSalvar({
      titulo: dados.titulo,
      descricao: dados.descricao,
      url: dados.url,
      tipoId: Number(dados.tipoId),
      categoriaId: Number(dados.categoriaId),
      nivelId: Number(dados.nivelId),
      idioma: dados.idioma,
      observacoes: dados.observacoes,
      tags: dados.tags,
    });
    setEnviando(false);
    if (limpou) setDados(RECOMENDACAO_VAZIA);
  }

  return (
    <form id="formulario_card" onSubmit={enviar}>
      {erroOpcoes && (
        <p>Não foi possível carregar o formulário. Recarregue a página e tente novamente.</p>
      )}

      <label>
        Título *
        <input type="text" name="titulo" required maxLength={200} value={dados.titulo} onChange={alterar} />
      </label>

      <label>
        Descrição *
        <textarea name="descricao" required value={dados.descricao} onChange={alterar} />
      </label>

      <label>
        Link do material *
        <input
          type="url"
          name="url"
          required
          maxLength={2048}
          pattern="https?://.+"
          value={dados.url}
          onChange={alterar}
        />
      </label>

      <label>
        Tipo *
        <select name="tipoId" id="campo_tipo" required value={dados.tipoId} onChange={alterar}>
          <option value="">Selecione</option>
          <Opcoes itens={tipos} />
        </select>
      </label>

      <label>
        Categoria *
        <select name="categoriaId" id="campo_categoria" required value={dados.categoriaId} onChange={alterar}>
          <option value="">Selecione</option>
          <Opcoes itens={categorias} />
        </select>
      </label>

      <fieldset>
        <legend>Tags * (1 a 5)</legend>
        <ListaTags
          id="lista_tags"
          {...tagsDaCategoria}
          marcadas={dados.tags}
          aoMudar={(tags) => setDados((atual) => ({ ...atual, tags }))}
          semCategoria={!dados.categoriaId}
          avisoSemCategoria="Escolha uma categoria para ver as tags."
        />
      </fieldset>

      <label>
        Nível de Aprendizado *
        <select name="nivelId" id="campo_nivel" required value={dados.nivelId} onChange={alterar}>
          <option value="">Selecione</option>
          <Opcoes itens={niveis} />
        </select>
      </label>

      <label>
        Idioma do material *
        <select name="idioma" required value={dados.idioma} onChange={alterar}>
          <option value="">Selecione</option>
          {IDIOMAS.map((idioma) => (
            <option key={idioma}>{idioma}</option>
          ))}
        </select>
      </label>

      <label>
        Observações do professor (Opcional)
        <textarea name="observacoes" value={dados.observacoes} onChange={alterar} />
      </label>

      <button type="submit" disabled={enviando}>
        {enviando ? "Salvando..." : "Salvar recomendação"}
      </button>
    </form>
  );
}
