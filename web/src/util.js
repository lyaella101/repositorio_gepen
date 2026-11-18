export function semAcentos(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function formatarData(data) {
  return new Date(data).toLocaleDateString("pt-BR");
}

export function classificacao(card) {
  return `${card.tipo} · ${card.categoria} · ${card.nivel}`;
}

export function nomesDasTags(card) {
  return card.tags.map((tag) => tag.nome).join(", ");
}

export const IDIOMAS = ["Japonês", "Português", "Inglês", "Outro"];
