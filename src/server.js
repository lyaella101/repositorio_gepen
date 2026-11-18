import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db.js";
import { requireAuth } from "./middlewares/requireAuth.js";
import { requireProfessor } from "./middlewares/requireProfessor.js";
import authRouter from "./routes/auth.js";
import opcoesRouter from "./routes/opcoes.js";
import cardsRouter from "./routes/cards.js";
import contasRouter from "./routes/contas.js";

const app = express();

// Produção (`npm run build` e depois `npm start`) entrega o React já pronto,
// da pasta dist/. Em desenvolvimento (`npm run dev`), o Vite cuida disso.
const producao =
  process.env.NODE_ENV === "production" || process.argv.includes("--producao");
const pastaDist = path.resolve("dist");

if (producao) {
  if (!existsSync(pastaDist)) {
    console.error("Pasta dist/ não encontrada. Rode `npm run build` antes de `npm start`.");
    process.exit(1);
  }
  app.use(express.static(pastaDist));
}

// PUBLICAÇÃO: descomentar quando o site estiver na hospedagem (ver README).
// app.set("trust proxy", 1);

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
app.use("/admin/contas", requireProfessor);

app.use(authRouter);
app.use(opcoesRouter);
app.use(cardsRouter);
app.use(contasRouter);

// Front-end em React (pasta web/).
if (producao) {
  // Qualquer outro endereço (/painel, /contas...) abre o React, que decide a tela.
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/admin/") || !req.accepts("html")) {
      return next();
    }
    res.sendFile(path.join(pastaDist, "index.html"));
  });
} else {
  // Desenvolvimento: o Vite roda dentro deste servidor e atualiza a página
  // sozinho a cada mudança em web/.
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
  console.log(`Rodando em http://localhost:${PORTA}`);
});
