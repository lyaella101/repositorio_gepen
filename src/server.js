import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { pool } from "./db.js";
import { requireAuth } from "./middlewares/requireAuth.js";

const app = express();

// PUBLICAÇÃO: descomentar quando o site estiver na hospedagem (ver README).
// app.set("trust proxy", 1);

app.use(express.static("public"));
app.use(express.json());

const PgStore = connectPgSimple(session);

app.use(session({
  store: new PgStore({ pool, createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,                  // Quando for publicar, alterar para true 
    maxAge: 1000 * 60 * 60 * 8,     
  },
}));

app.use("/admin", requireAuth)

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Informe e-mail e senha" });
  }

  try {
    const resultado = await pool.query(
      "SELECT id, nome, senha_hash, ativo FROM administrador WHERE LOWER(email) = LOWER($1)",
      [email]
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

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
  console.log(`Rodando em http://localhost:${PORTA}`);
});