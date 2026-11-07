import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/tipos", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT id,nome FROM tipo ORDER BY nome ASC",
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error("Erro ao buscar tipos:", error);
    res.status(500).json({ error: "Erro ao buscar tipos" });
  }
});

router.get("/categorias", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT id,nome FROM categoria ORDER BY nome ASC",
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    res.status(500).json({ error: "Erro ao buscar categorias" });
  }
});

router.get("/niveis", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT id,nome FROM nivel ORDER BY ordem ASC",
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error("Erro ao buscar niveis:", error);
    res.status(500).json({ error: "Erro ao buscar niveis" });
  }
});

router.get("/categorias/:id/tags", async (req, res) => {
  const categoriaId = Number(req.params.id);

  if (!Number.isInteger(categoriaId) || categoriaId < 1) {
    return res.status(400).json({ error: "Categoria inválida" });
  }
  try {
    const resultado = await pool.query(
      "SELECT id, nome FROM tag WHERE categoria_id = $1 ORDER BY nome ASC",
      [categoriaId],
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error("Erro ao buscar as tags", error);
    res.status(500).json({ error: "Erro ao buscar as tags" });
  }
});

export default router;
