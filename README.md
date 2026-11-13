# Repositório GEPEN

Repositório web de recomendações de materiais de língua e cultura japonesa do
Grupo de Ensino e Pesquisas Nipônicas (GEPEN), da Universidade Federal do Ceará.

Professores e bolsistas cadastram as recomendações; os estudantes consultam o
catálogo, sem precisar de conta.

Projeto desenvolvido para a disciplina de Engenharia de Software.

## Funcionalidades

**Área pública (estudantes)**

- Catálogo de recomendações, das mais recentes para as mais antigas
- Busca pelo título, sem diferenciar maiúsculas e acentos
- Filtros combináveis por tipo, categoria, tags, nível e idioma
- Detalhes de cada recomendação em uma janela, com link para o material

**Área administrativa (professores e bolsistas)**

- Login, logout e alteração de senha
- Limite de tentativas de login
- Painel com busca pelo título e filtros por tipo, categoria, nível e idioma
- Cadastro, edição e exclusão de recomendações, com tags por categoria
- Gerenciamento de contas (somente professores)

## Tecnologias

- Node.js e Express
- PostgreSQL (extensões `unaccent` e `pgcrypto`)
- HTML, CSS e JavaScript, sem frameworks
- Bibliotecas: `pg`, `bcryptjs`, `express-session`, `connect-pg-simple`,
  `express-rate-limit`, `dotenv`

## Como rodar o projeto

### 1. Pré-requisitos

Instale, se ainda não tiver:

- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org) (versão LTS)
- [PostgreSQL](https://www.postgresql.org), com o pgAdmin (já vem no instalador).
  Anote a senha do usuário `postgres` que você escolher na instalação.
- Um editor de código, como o [VS Code](https://code.visualstudio.com)

Para conferir se deu certo, abra um terminal e rode `git --version` e
`node --version`. Os dois devem mostrar um número de versão.

### 2. Baixar o projeto e instalar as dependências

```
git clone [endereço do repositório]
cd repositorio_gepen
npm install
```

O `npm install` baixa as bibliotecas listadas no `package.json` para a pasta
`node_modules`. Essa pasta não vai para o repositório: cada pessoa gera a sua.

### 3. Criar o banco de dados

1. No pgAdmin, clique com o botão direito em **Databases** → **Create** →
   **Database...** e crie um banco chamado `gepen`.
2. Clique com o botão direito no banco `gepen` → **Query Tool**.
3. Abra cada script da pasta `db` (ícone de pasta do Query Tool), e rode com
   **F5**, **nesta ordem**:
   1. `01_schema.sql`: as tabelas
   2. `02_seed.sql`: tipos, categorias, níveis e tags
   3. `03_dados_teste.sql`: um professor de teste e recomendações de exemplo
      (**somente em desenvolvimento**, rodar uma única vez)

### 4. Configurar as variáveis de ambiente

Copie o arquivo `.env.example`, renomeie a cópia para `.env` e preencha:

- `DATABASE_URL`: o endereço do seu banco local, no formato
  ```
  postgresql://postgres:SUA_SENHA@localhost:5432/gepen
  ```
  trocando `SUA_SENHA` pela senha do usuário `postgres` da sua instalação
- `SESSION_SECRET`: uma chave aleatória, gerada com:
  ```
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

O arquivo `.env` não vai para o repositório: cada pessoa tem o seu, porque ele
guarda a senha do banco.

### 5. Iniciar o servidor

```
npm run dev
```

O terminal deve mostrar que o servidor está rodando. Deixe-o aberto enquanto
usa o site; para parar, aperte `Ctrl + C`.

- Catálogo: http://localhost:3000
- Login: http://localhost:3000/login.html
- Conta de teste: `professor.teste@ufc.br` / `SenhaTeste2026`

Para criar outras contas de teste pelo terminal:

```
node scripts/criar_admin.js "Nome" email@exemplo.com professor
```

O papel pode ser `professor` ou `bolsista`. A senha provisória é mostrada uma
única vez no terminal. Também é possível criar contas pela tela **Contas**,
entrando como professor.

### Problemas comuns

| Sintoma | Causa provável |
| Erro de senha ou `DATABASE_URL` indefinida ao iniciar | O `.env` não foi salvo, está com outro nome ou com a senha errada |
| `database "gepen" does not exist` | O banco não foi criado, ou foi criado com outro nome |
| `relation "..." does not exist` | Os scripts do banco não foram rodados, ou foram rodados no banco errado |
| A página não mostra uma mudança feita no código | Cache do navegador: aperte `Ctrl + F5` |
| `EADDRINUSE` na porta 3000 | O servidor já está aberto em outro terminal |

## Como navegar pelo código

### Estrutura de pastas

```
db/                    scripts SQL (schema, seed e dados de teste)
public/                páginas HTML e o JavaScript que roda no navegador
scripts/               ferramentas de linha de comando (criar_admin.js)
src/
  server.js            configuração do servidor
  db.js                conexão com o banco
  middlewares/         requireAuth (está logado?) e requireProfessor (é professor?)
  routes/              rotas: auth, opcoes, cards e contas
  utils/               funções de validação
```

### Por onde começar a ler

1. **`db/01_schema.sql`**: as tabelas e como se ligam. Todo o resto depende delas.
2. **`src/server.js`**: a ordem em que o servidor monta tudo (arquivos
   estáticos, sessão, proteção das rotas `/admin` e as rotas).
3. **Um caminho completo**, do navegador ao banco. Por exemplo, o catálogo:
   `public/index.html` → `public/catalogo.js` (faz o `fetch("/cards")`) →
   `src/routes/cards.js` (rota `GET /cards`, que faz o `SELECT`) → banco.

Cada página de `public/` segue esse mesmo padrão: um `.html` com a tela e um
`.js` com o mesmo nome, que conversa com uma rota de `src/routes/`.

| Página | JavaScript | Rotas usadas |
| `index.html` (catálogo) | `catalogo.js` | `routes/cards.js`, `routes/opcoes.js` |
| `login.html` | `login.js` | `routes/auth.js` |
| `admin.html` (painel) | `admin.js` | `routes/cards.js`, `routes/opcoes.js`, `routes/auth.js` |
| `novo_card.html` | `novo_card.js` | `routes/cards.js`, `routes/opcoes.js` |
| `editar_card.html` | `editar_card.js` | `routes/cards.js`, `routes/opcoes.js` |
| `contas.html` | `contas.js` | `routes/contas.js` |
| `senha.html` | `senha.js` | `routes/auth.js` |

## Regras de negócio e segurança

**Senhas**

- Entre 8 e 64 caracteres, e no máximo 72 bytes (limite do bcrypt)
- Guardadas somente como hash bcrypt, nunca em texto
- Ao alterar a senha, as outras sessões abertas da conta são encerradas

**Sessão**

- Guardada no PostgreSQL, em um cookie `httpOnly`
- Expira em 8 horas
- Todas as rotas que começam com `/admin` exigem login

**Limite de tentativas de login**

- Até 5 tentativas erradas por IP a cada 5 minutos
- Na 6ª tentativa, o acesso é bloqueado, inclusive com a senha correta
- A liberação é automática ao fim do período; logins corretos não contam
- A mensagem de erro não revela se o e-mail existe

**Contas e permissões**

- A primeira conta (professor) é criada pelo script `script/criar_admin.js` automaticamente na publicação
- Qualquer professor pode criar professores e bolsistas
- Qualquer professor pode desativar bolsistas
- Somente o professor original (a primeira conta de professor) pode desativar
  outros professores
- Ninguém pode desativar a própria conta
- Contas desativadas não conseguem entrar, e suas sessões são encerradas

**Recomendações**

- Obrigatórios: título, link, descrição, tipo, categoria, nível, idioma e de
  1 a 5 tags
- O link precisa usar `http` ou `https`
- As tags precisam pertencer à categoria da recomendação
- O cadastro e a edição gravam a recomendação e as tags juntas, em uma
  transação: se algo falhar, nada é gravado

**Busca e filtros**

- A busca e os filtros podem ser combinados; o resultado mostra as
  recomendações que atendem a todos eles
- No filtro de tags do catálogo, aparecem apenas as recomendações que têm todas
  as tags marcadas

## Banco de dados

7 tabelas: `administrador`, `tipo`, `categoria`, `nivel`, `tag`, `card` e
`card_tag` (mais a tabela `session`, criada automaticamente pela biblioteca de
sessões).

### Operações SQL da aplicação

| Operação | Funcionalidade | Onde |
| `SELECT` | Login | `routes/auth.js` |
| `SELECT` | Dados do usuário logado | `routes/auth.js` |
| `SELECT` | Tipos, categorias, níveis e tags | `routes/opcoes.js` |
| `SELECT` | Listagem do catálogo e do painel | `routes/cards.js` |
| `SELECT` | Uma recomendação, para edição | `routes/cards.js` |
| `SELECT` | Listagem de contas | `routes/contas.js` |
| `INSERT` | Cadastro de recomendação (`card`) | `routes/cards.js` |
| `INSERT` | Tags da recomendação (`card_tag`) | `routes/cards.js` |
| `INSERT` | Cadastro de conta (`administrador`) | `routes/contas.js` |
| `UPDATE` | Alteração de senha | `routes/auth.js` |
| `UPDATE` | Edição de recomendação | `routes/cards.js` |
| `UPDATE` | Desativação de conta | `routes/contas.js` |
| `DELETE` | Exclusão de recomendação | `routes/cards.js` |
| `DELETE` | Troca das tags na edição (`card_tag`) | `routes/cards.js` |
| `DELETE` | Encerramento de sessões | `routes/auth.js`, `routes/contas.js` |

## Limitações conhecidas

- Os contadores do limite de tentativas ficam na memória e zeram quando o
  servidor reinicia
- Em redes compartilhadas (como a da universidade), várias pessoas usam o mesmo
  IP; erros de outras pessoas podem bloquear o login por até 5 minutos
- A disponibilidade dos links depende dos sites de origem
- A troca da senha provisória no primeiro acesso é uma orientação, e não é
  obrigatória pelo sistema
- A busca e os filtros rodam no navegador; se o catálogo passar de alguns
  milhares de recomendações, a filtragem deve ir para o servidor

## Publicação

Ajustes necessários antes de publicar:

1. No `server.js`, ativar `app.set("trust proxy", 1)`
2. No cookie da sessão, usar `secure: true` (exige HTTPS)
3. Criar a conta do professor rodando `scripts/criar_admin.js` com a
   `DATABASE_URL` do banco de produção, e entregar a senha provisória ao
   professor por um canal seguro
4. No banco de produção, rodar somente `01_schema.sql` e `02_seed.sql`
5. Usar, no banco de produção, um usuário próprio da aplicação, com permissão
   apenas no banco do projeto

## Melhorias futuras

- Convite e recuperação de senha por e-mail
- Filtro por data (ano, mês e semana)
- Criação automática da conta do professor na primeira inicialização do servidor
