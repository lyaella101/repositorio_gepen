import crypto from "crypto";
import bcrypt from "bcryptjs";
import { pool } from "../src/db.js";

const [nome, email, papel] = process.argv.slice(2);

if (!nome || !email || !papel) {
  console.log('Uso: node scripts/criar_admin.js "Nome" email papel');
  console.log(
    'Exemplo: node scripts/criar_admin.js "Luana Souza" luana@ufc.br professor',
  );
  process.exit(1);
}

if (papel !== "professor" && papel !== "bolsista") {
  console.log('Papel inválido. Use "professor" ou "bolsista".');
  process.exit(1);
}

const senha = crypto.randomBytes(9).toString("base64url");
const hash = await bcrypt.hash(senha, 10);

try {
  await pool.query(
    "INSERT INTO administrador (nome, email, senha_hash, papel) VALUES ($1, $2, $3, $4)",
    [nome.trim(), email.trim(), hash, papel],
  );

  console.log(`Administrador criado: ${nome} (${papel})`);
  console.log(`Senha provisória: ${senha}`);
  console.log(
    "Entregue por um canal seguro e peça para trocar no primeiro acesso.",
  );
} catch (error) {
  if (error.code === "23505") {
    console.log("Já existe um administrador com esse e-mail.");
  } else {
    console.error("Erro ao criar administrador:", error);
  }
} finally {
  await pool.end();
}
