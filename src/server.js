import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db.js";
import { requireAuth } from "./middlewares/requireAuth.js";
import authRouter from "./routes/auth.js";
import opcoesRouter from "./routes/opcoes.js";
import cardsRouter from "./routes/cards.js";

const app = express();

// PUBLICAÇÃO: descomentar quando o site estiver na hospedagem (ver README).
// app.set("trust proxy", 1);

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
      secure: false, // PUBLICAÇÃO: true (exige https)
      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
);

app.use("/admin", requireAuth);

app.use(authRouter);
app.use(opcoesRouter);
app.use(cardsRouter);

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
  console.log(`Rodando em http://localhost:${PORTA}`);
});
