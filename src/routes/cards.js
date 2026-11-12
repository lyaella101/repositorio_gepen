import express from "express";
import { pool } from "../db.js";
import { urlValida, urlHttpsValida } from "../utils/validacao.js";

const router = express.Router();

const IDIOMAS = ["Japonês", "Português", "Inglês", "Outro"];
const MAXIMO_TAGS = 5;

function idValido(valor) {
  return Number.isInteger(valor) && valor >= 1;
}

function validarCard(dados) {
  const {
    titulo,
    url,
    descricao,
    tipoId,
    categoriaId,
    nivelId,
    idioma,
    imagemUrl,
    tags,
  } = dados;
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
    return "Preencha todos os campos obrigatórios";
  }

  if (titulo.trim().length > 200) {
    return "O título deve ter no máximo 200 caracteres";
  }

  if (url.length > 2048 || !urlValida(url)) {
    return "URL inválida. Use um endereço começando com http:// ou https://";
  }

  if (!idValido(tipoId) || !idValido(categoriaId) || !idValido(nivelId)) {
    return "Tipo, categoria ou nível inválido";
  }

  if (!IDIOMAS.includes(idioma)) {
    return "Escolha um idioma válido";
  }

  if (imagemUrl && (imagemUrl.length > 2048 || !urlHttpsValida(imagemUrl))) {
    return "A URL da imagem precisa começar com https://";
  }

  if (!Array.isArray(tags) || tags.length < 1 || tags.length > MAXIMO_TAGS) {
    return `Escolha de 1 a ${MAXIMO_TAGS} tags`;
  }

  if (!tags.every(idValido)) {
    return "Tags inválidas";
  }

  return null;
}

router.get("/cards", async (req, res) => {
  try {
    const resultado = await pool.query(`SELECT 
c.id,
c.titulo,
c.url,
c.descricao,
c.idioma,
c.observacoes,
c.imagem_url,
c.data_envio,
tp.nome AS tipo,
cat.nome AS categoria,
n.nome AS nivel,
  ( SELECT COALESCE(json_agg(json_build_object('id', t.id, 'nome', t.nome) ORDER BY t.nome), '[]')
    FROM card_tag ct, tag t
    WHERE ct.card_id = c.id
      AND t.id = ct.tag_id
  ) AS tags
FROM card AS c, tipo AS tp, categoria as cat, nivel AS n
WHERE tp.id  = c.tipo_id
  AND cat.id = c.categoria_id
  AND n.id   = c.nivel_id
ORDER BY c.data_envio DESC`);

    res.json(resultado.rows);
  } catch (error) {
    console.error("Erro ao listar as recomendações", error);
    res.status(500).json({ error: "Erro ao listar as recomendações" });
  }
});

router.get("/admin/cards/:id", async (req, res) => {
  const cardId = Number(req.params.id);

  if (!idValido(cardId)) {
    return res.status(400).json({ error: "Recomendação inválida" });
  }

  try {
    const resultado = await pool.query(
      `
      SELECT
         c.id, c.titulo, c.url, c.descricao, c.tipo_id, c.categoria_id,
         c.nivel_id, c.idioma, c.observacoes, c.imagem_url,
         (SELECT COALESCE(json_agg(ct.tag_id), '[]')
          FROM card_tag ct
          WHERE ct.card_id = c.id) AS tags
       FROM card c
       WHERE c.id = $1`,
      [cardId],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Recomendação não encontrada" });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar recomendação", error);
    res.status(500).json({ error: "Erro ao buscar recomendação " });
  }
});

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

  const erro = validarCard(req.body);

  if (erro) {
    return res.status(400).json({ error: erro });
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

router.put("/admin/cards/:id", async (req, res) => {
  const cardId = Number(req.params.id);

  if (!idValido(cardId)) {
    return res.status(400).json({ error: "Recomendação inválida" });
  }

  const erro = validarCard(req.body);

  if (erro) {
    return res.status(400).json({ error: erro });
  }

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
      `UPDATE card SET
         tipo_id = $1, categoria_id = $2, nivel_id = $3, titulo = $4, url = $5,
         descricao = $6, idioma = $7, observacoes = $8, imagem_url = $9,
         atualizado_em = NOW()
       WHERE id = $10`,
      [
        tipoId,
        categoriaId,
        nivelId,
        titulo.trim(),
        url.trim(),
        descricao.trim(),
        idioma,
        observacoes?.trim() || null,
        imagemUrl || null,
        cardId,
      ],
    );

    if (resultado.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Recomendação não encontrada" });
    }

    await client.query("DELETE FROM card_tag WHERE card_id = $1", [cardId]);

    for (const tagId of tagsSemRepeticao) {
      await client.query(
        "INSERT INTO card_tag (card_id, tag_id) VALUES ($1, $2)",
        [cardId, tagId],
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Recomendação atualizada com sucesso" });
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

    console.error("Erro ao atualizar recomendação:", error);
    res.status(500).json({ error: "Erro ao atualizar recomendação" });
  } finally {
    client.release();
  }
});

router.delete("/admin/cards/:id", async (req, res) => {
  const cardId = Number(req.params.id);

  if (!idValido(cardId)) {
    return res.status(400).json({ error: "Recomendação inválida" });
  }

  try {
    const resultado = await pool.query("DELETE FROM card WHERE id = $1", [
      cardId,
    ]);

    if (resultado.rowCount === 0) {
      return res.status(404).json({ error: "Recomendação não foi encontrada" });
    }
    res.json({ message: "Recomendação excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir recomendação", error);
    res.status(500).json({ error: "Erro ao excluir recomendação" });
  }
});

export default router;
