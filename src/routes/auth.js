import express from "express";
import bcrypt from "bcryptjs";
import { rateLimit } from "express-rate-limit";
import { pool } from "../db.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  message: { error: "Muitas tentativas de login. Tente novamente mais tarde." },
});

router.post("/login", loginLimiter, async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Informe e-mail e senha" });
  }

  try {
    const resultado = await pool.query(
      "SELECT id, nome, senha_hash, ativo FROM administrador WHERE LOWER(email) = LOWER($1)",
      [email],
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: "E-mail ou senha inválidos" });
    }

    const administrador = resultado.rows[0];

    const senhaCorreta = await bcrypt.compare(senha, administrador.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ error: "E-mail ou senha inválidos" });
    }

    if (!administrador.ativo) {
      return res.status(401).json({ error: "E-mail ou senha inválidos" });
    }

    req.session.regenerate((erro) => {
      if (erro) {
        console.error("Erro ao criar sessão:", erro);
        return res.status(500).json({ error: "Erro ao realizar login" });
      }

      req.session.administradorId = administrador.id;

      res.json({ message: "Login realizado com sucesso" });
    });
  } catch (error) {
    console.error("Erro ao realizar login:", error);
    res.status(500).json({ error: "Erro ao realizar login" });
  }
});

router.get("/admin/eu", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT nome, papel FROM administrador WHERE id = $1",
      [req.session.administradorId],
    );
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar administrador:", error);
    res.status(500).json({ error: "Erro ao buscar administrador" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((erro) => {
    if (erro) {
      console.error("Erro ao destruir sessão:", erro);
      return res.status(500).json({ error: "Erro ao destruir sessão" });
    }
    res.clearCookie("connect.sid");
    res.redirect("/login.html");
  });
});

router.post("/admin/senha", async (req, res) => {
  const { senhaAtual, novaSenha, confirmarNovaSenha } = req.body;
  if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }
  if (novaSenha !== confirmarNovaSenha) {
    return res.status(400).json({ error: "As senhas não coincidem" });
  }
  if (novaSenha.length > 64 || novaSenha.length < 8) {
    return res
      .status(400)
      .json({ error: "A nova senha deve ter entre 8 e 64 caracteres" });
  }
  if (Buffer.byteLength(novaSenha, "utf8") > 72) {
    return res
      .status(400)
      .json({ error: "A nova senha é muito longa, use menos caracteres" });
  }
  if (novaSenha === senhaAtual) {
    return res
      .status(400)
      .json({ error: "A nova senha não pode ser igual à senha atual" });
  }
  try {
    const resultado = await pool.query(
      "SELECT senha_hash FROM administrador WHERE id = $1",
      [req.session.administradorId],
    );
    const administrador = resultado.rows[0];
    const isMatch = await bcrypt.compare(senhaAtual, administrador.senha_hash);
    if (!isMatch) {
      return res.status(400).json({ error: "Senha atual incorreta" });
    }
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    await pool.query("UPDATE administrador SET senha_hash = $1 WHERE id = $2", [
      novaSenhaHash,
      req.session.administradorId,
    ]);
    await pool.query(
      "DELETE FROM session WHERE sess->>'administradorId' = $1 AND sid <> $2",
      [String(req.session.administradorId), req.sessionID],
    );
    res.json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    res.status(500).json({ error: "Erro ao alterar senha" });
  }
});

export default router;
