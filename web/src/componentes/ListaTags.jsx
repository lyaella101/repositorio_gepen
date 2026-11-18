// Tags de uma categoria como chips com caixa de seleção.
// "marcadas" é uma lista de ids; "aoMudar" recebe a nova lista.
export default function ListaTags({ id, tags, marcadas, aoMudar, carregando, erro, avisoSemCategoria, semCategoria }) {
  function alternar(tagId) {
    aoMudar(marcadas.includes(tagId) ? marcadas.filter((t) => t !== tagId) : [...marcadas, tagId]);
  }

  let conteudo;
  if (semCategoria) conteudo = avisoSemCategoria;
  else if (erro) conteudo = "Não foi possível carregar as tags.";
  else if (carregando) conteudo = "Carregando...";
  else if (tags.length === 0) conteudo = "Esta categoria ainda não tem tags.";
  else
    conteudo = tags.map((tag) => (
      <label key={tag.id}>
        <input
          type="checkbox"
          name="tags"
          value={tag.id}
          checked={marcadas.includes(tag.id)}
          onChange={() => alternar(tag.id)}
        />{" "}
        {tag.nome}
      </label>
    ));

  return <div id={id}>{conteudo}</div>;
}
