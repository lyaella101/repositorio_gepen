import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { pool } from "./db.js";
import { rateLimit } from "express-rate-limit";
import { requireAuth } from "./middlewares/requireAuth.js";

const app = express();

// PUBLICAÇÃO: descomentar quando o site estiver na hospedagem (ver README).
// app.set("trust proxy", 1);

const loginlimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  message: { error: "Muitas tentativas de login. Tente novamente mais tarde." },
});

app.use(express.static("public"));
app.use(express.json());

const PgStore = connectPgSimple(session);

app.use(
  session({
    store: new PgStore({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // Quando for publicar, alterar para true
      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
);

app.use("/admin", requireAuth);

app.post("/login", loginlimiter, async (req, res) => {
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

app.get("/admin/eu", async (req, res) => {
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

app.post("/logout", (req, res) => {
  req.session.destroy((erro) => {
    if (erro) {
      console.error("Erro ao destruir sessão:", erro);
      return res.status(500).json({ error: "Erro ao destruir sessão" });
    }
    res.clearCookie("connect.sid");
    res.redirect("/login.html");
  });
});

app.post("/admin/senha", async (req, res) => {
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

app.get("/tipos", async (req, res) => {
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

app.get("/categorias", async (req, res) => {
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

app.get("/niveis", async (req, res) => {
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

app.get("/categorias/:id/tags", async (req, res) => {
    const categoriaId = Number(req.params.id);

    if(!Number.isInteger(categoriaId) || categoriaId < 1 ) {
        return res.status(400).json({error: "Categoria inválida"})
    }
    try {
        const resultado = await pool.query(
            "SELECT id, nome FROM tag WHERE categoria_id = $1 ORDER BY nome ASC", [categoriaId]);
        res.json(resultado.rows)
    }
    catch (error){
        console.error("Erro ao buscar as tags", error);
        res.status(500).json({error: "Erro ao buscar as tags"})

    }
});




const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
  console.log(`Rodando em http://localhost:${PORTA}`);
});
