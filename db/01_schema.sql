CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION f_unaccent(text) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS 
$$ SELECT public.unaccent('public.unaccent', $1) $$;

CREATE TABLE administrador (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    papel VARCHAR(20) NOT NULL CHECK (papel IN ('professor', 'bolsista')),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX administrador_email_unico ON administrador (LOWER(email));

CREATE TABLE tipo (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

CREATE UNIQUE INDEX tipo_nome_unico ON tipo (LOWER(nome));

CREATE TABLE categoria (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

CREATE UNIQUE INDEX categoria_nome_unico ON categoria (LOWER(nome));

CREATE TABLE nivel (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    ordem INTEGER NOT NULL
);

CREATE UNIQUE INDEX nivel_nome_unico ON nivel (LOWER(nome));

CREATE TABLE tag (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(nome)) > 0),
    categoria_id INTEGER NOT NULL REFERENCES categoria(id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX tag_nome_categoria_unico ON tag (categoria_id, LOWER(f_unaccent(nome)));

CREATE TABLE card (
    id SERIAL PRIMARY KEY,
    administrador_id INTEGER NOT NULL REFERENCES administrador(id) ON DELETE RESTRICT,
    tipo_id INTEGER NOT NULL REFERENCES tipo(id) ON DELETE RESTRICT,
    categoria_id INTEGER NOT NULL REFERENCES categoria(id) ON DELETE RESTRICT,
    nivel_id INTEGER NOT NULL REFERENCES nivel(id) ON DELETE RESTRICT,
    titulo VARCHAR(200) NOT NULL CHECK (LENGTH(TRIM(titulo)) > 0),
    descricao TEXT NOT NULL CHECK (LENGTH(TRIM(descricao)) > 0),
    url VARCHAR(2048) NOT NULL CHECK (url ~* '^https?://[^\s]+$'),
    idioma VARCHAR(20) NOT NULL CHECK (idioma IN ('Japonês','Português', 'Inglês', 'Outro')),
    observacoes TEXT,
    data_envio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE card_tag (
    card_id INTEGER NOT NULL REFERENCES card(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
    PRIMARY KEY (card_id, tag_id)
);

CREATE INDEX card_data_envio_idx ON card (data_envio);
CREATE INDEX card_tipo_idx       ON card (tipo_id);
CREATE INDEX card_categoria_idx  ON card (categoria_id);
CREATE INDEX card_nivel_idx      ON card (nivel_id);
CREATE INDEX card_tag_tag_idx    ON card_tag (tag_id);