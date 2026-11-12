import { pool } from "../db.js";

export async function requireProfessor(req, res, next) {
  try {
    const resultado = await pool.query(
      ` SELECT papel, ativo FROM administrador WHERE id = $1`,
      [req.session.administradorId],
    );

    const conta = resultado.rows[0];

    if (!conta || conta.papel !== "professor" || !conta.ativo) {
      return res
        .status(403)
        .json({ error: "Acesso permitido apenas ao professor" });
    }

    next();
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
    res.status(500).json({ error: "Erro ao verificar permissão" });
  }
}
