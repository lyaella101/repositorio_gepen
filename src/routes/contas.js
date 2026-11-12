import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";

const router = express.Router();

function idValido(valor) {
  return Number.isInteger(valor) && valor >= 1;
}

router.get("/admin/contas", async (req, res) => {
  try {
    const resultado = await pool.query(`
            SELECT id, nome, email, papel, ativo, criado_em FROM administrador 
            ORDER BY nome`);

    res.json(resultado.rows);
  } catch (error) {
    console.error("Erro ao listar contas", error);
    res.status(500).json({ error: "Erro ao listar contas" });
  }
});

router.post("/admin/contas", async (req, res) => {
  const { nome, email, papel } = req.body;

  if (!nome || !nome.trim() || !email || !email.trim()) {
    return res.status(400).json({ error: "Informe o nome e o e-mail" });
  }
  if (nome.trim().length > 100) {
    return res
      .status(400)
      .json({ error: "O nome deve ter no máximo 100 caracteres" });
  }
  if (email.trim().length > 255 || !email.includes("@")) {
    return res.status(400).json({ error: "Informe um email válido" });
  }
  if (papel != "professor" && papel !== "bolsista") {
    return res
      .status(400)
      .json({ error: "Escolha um papel: professor ou bolsista" });
  }

  const senhaProvisoria = crypto.randomBytes(9).toString("base64url");
  const hash = await bcrypt.hash(senhaProvisoria, 10);

  try {
    const resultado = await pool.query(
      `
        INSERT INTO administrador (nome, email, senha_hash, papel) 
        VALUES ($1, $2, $3 , $4)
        RETURNING id`,
      [nome.trim(), email.trim(), hash, papel],
    );

    res.status(201).json({
      message: "Novo administrador cadastrado com sucesso",
      id: resultado.rows[0].id,
      senhaProvisoria,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(400)
        .json({ error: "Já existe uma conta com esse email" });
    }
    console.error("Erro ao cadastrar administrador", error);
    res.status(500).json({ error: "Erro ao cadastrar administrador" });
  }
});

router.patch("/admin/contas/:id/desativar", async (req, res) => {
  const contaId = Number(req.params.id);
  const quemPede = req.session.administradorId;

  if (!idValido(contaId)) {
    return res.status(400).json({ error: "Conta inválida" });
  }

  if (contaId === quemPede) {
    return res
      .status(400)
      .json({ error: "Você não pode desativar a própria conta" });
  }

  try {
    const busca = await pool.query(
      "SELECT papel FROM administrador WHERE id = $1",
      [contaId],
    );
    const alvo = busca.rows[0];

    if (!alvo) {
      return res.status(404).json({ error: "Conta não encontrada" });
    }

    if (alvo.papel === "professor") {
      const original = await pool.query(
        "SELECT MIN(id) AS id FROM administrador WHERE papel = 'professor'",
      );
      if (original.rows[0].id !== quemPede) {
        return res.status(403).json({
          error:
            "Apenas o professor original pode desativar outros professores",
        });
      }
    }

    await pool.query("UPDATE administrador SET ativo = false WHERE id = $1", [
      contaId,
    ]);
    await pool.query(
      "DELETE FROM session WHERE sess->>'administradorId' = $1",
      [String(contaId)],
    );

    res.json({ message: "Conta desativada com sucesso" });
  } catch (error) {
    console.error("Erro ao desativar conta:", error);
    res.status(500).json({ error: "Erro ao desativar conta" });
  }
});
export default router;
