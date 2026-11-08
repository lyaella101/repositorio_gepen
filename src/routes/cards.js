import express from "express";
import { pool } from "../db.js";
import { urlValida, urlHttpsValida } from "../utils/validacao.js";

const router = express.Router();

const IDIOMAS = ["Japonês", "Português", "Inglês", "Outro"];
const MAXIMO_TAGS = 5;

function idValido(valor) {
  return Number.isInteger(valor) && valor >= 1;
}

router.post("/admin/cards", async (req, res) => {
  const {
    titulo,
    url,
    descricao,
    tipoId,
    categoriaId,
    nivelId,
    idioma,
    observacoes,
    imagemUrl,
    tags,
  } = req.body;

  if (
    !titulo ||
    !titulo.trim() ||
    !url ||
    !descricao ||
    !descricao.trim() ||
    !tipoId ||
    !categoriaId ||
    !nivelId ||
    !idioma ||
    !tags
  ) {
    return res
      .status(400)
      .json({ error: "Preencha todos os campos obrigatórios" });
  }

  if (titulo.trim().length > 200) {
    return res
      .status(400)
      .json({ error: "O título deve ter no máximo 200 caracteres" });
  }

  if (url.length > 2048 || !urlValida(url)) {
    return res.status(400).json({
      error: "URL inválida. Use um endereço começando com http:// ou https://",
    });
  }

  if (!idValido(tipoId) || !idValido(categoriaId) || !idValido(nivelId)) {
    return res.status(400).json({ error: "Tipo, categoria ou nível inválido" });
  }

  if (!IDIOMAS.includes(idioma)) {
    return res.status(400).json({ error: "Escolha um idioma válido" });
  }

  if (imagemUrl && (imagemUrl.length > 2048 || !urlHttpsValida(imagemUrl))) {
    return res
      .status(400)
      .json({ error: "A URL da imagem precisa começar com https://" });
  }

  if (!Array.isArray(tags) || tags.length < 1 || tags.length > MAXIMO_TAGS) {
    return res
      .status(400)
      .json({ error: `Escolha de 1 a ${MAXIMO_TAGS} tags` });
  }

  if (!tags.every(idValido)) {
    return res.status(400).json({ error: "Tags inválidas" });
  }

  const tagsSemRepeticao = [...new Set(tags)];

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const conferencia = await client.query(
      "SELECT COUNT(*) AS total FROM tag WHERE id = ANY($1) AND categoria_id = $2",
      [tagsSemRepeticao, categoriaId],
    );

    if (Number(conferencia.rows[0].total) !== tagsSemRepeticao.length) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Escolha tags da categoria selecionada" });
    }

    const resultado = await client.query(
      `INSERT INTO card
         (administrador_id, tipo_id, categoria_id, nivel_id, titulo, url,
          descricao, idioma, observacoes, imagem_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        req.session.administradorId,
        tipoId,
        categoriaId,
        nivelId,
        titulo.trim(),
        url.trim(),
        descricao.trim(),
        idioma,
        observacoes?.trim() || null,
        imagemUrl || null,
      ],
    );

    const cardId = resultado.rows[0].id;

    for (const tagId of tagsSemRepeticao) {
      await client.query(
        "INSERT INTO card_tag (card_id, tag_id) VALUES ($1, $2)",
        [cardId, tagId],
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Recomendação cadastrada com sucesso",
      id: cardId,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23503") {
      return res
        .status(400)
        .json({ error: "Tipo, categoria ou nível inválido" });
    }
    if (error.code === "23514") {
      return res
        .status(400)
        .json({ error: "Dados inválidos. Confira os campos." });
    }

    console.error("Erro ao cadastrar recomendação:", error);
    res.status(500).json({ error: "Erro ao cadastrar recomendação" });
  } finally {
    client.release();
  }
});

export default router;
