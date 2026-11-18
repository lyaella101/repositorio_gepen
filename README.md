# Repositório GEPEN

Catálogo web de recomendações de materiais de língua e cultura japonesa do
Grupo de Ensino e Pesquisas Nipônicas (GEPEN), da Universidade Federal do Ceará.

Professores e bolsistas cadastram as recomendações; os estudantes consultam o
catálogo, sem precisar de conta.

Projeto desenvolvido para a disciplina Engenharia de Software.

## Funcionalidades

**Área pública (estudantes)**

- Catálogo de recomendações, das mais recentes para as mais antigas
- Busca pelo título, sem diferenciar maiúsculas e acentos
- Filtros combináveis por tipo, categoria, tags, nível e idioma
- Detalhes de cada recomendação em uma janela, com link para o material

**Área administrativa (professores e bolsistas)**

- Acesso da equipe por um link discreto no rodapé do catálogo
- Login, logout e alteração de senha
- Limite de tentativas de login
- Painel com busca pelo título e filtros por tipo, categoria, nível e idioma
- Cadastro, edição e exclusão de recomendações, com tags por categoria
- Gerenciamento de contas: criação, desativação e redefinição de senha (somente professores)

## Tecnologias

- Node.js e Express
- PostgreSQL (extensões `unaccent` e `pgcrypto`)
- Front-end em React 19, com Vite (pasta `web/`)
- Bibliotecas: `pg`, `bcryptjs`, `express-session`, `connect-pg-simple`,
  `express-rate-limit`, `dotenv`

## Como rodar o projeto

### 1. Pré-requisitos

Instale, se ainda não tiver:

- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org), versão 20 ou mais recente (a versão LTS do site serve)
- [PostgreSQL](https://www.postgresql.org), com o pgAdmin (já vem no instalador).
  Anote a senha do usuário `postgres` que você escolher na instalação.
- Um editor de código, como o [VS Code](https://code.visualstudio.com)

Para conferir se deu certo, abra um terminal e rode `git --version` e
`node --version`. Os dois devem mostrar um número de versão.

### 2. Baixar o projeto e instalar as dependências

```
git clone https://github.com/lyaella101/repositorio_gepen.git
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

Copie o arquivo `.env.example` para um novo arquivo chamado `.env`:

```
copy .env.example .env      (Windows)
cp .env.example .env        (Linux e Mac)
```

Abra o `.env` e preencha:

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

Em desenvolvimento, o Express carrega o Vite junto: ao salvar um arquivo de
`web/`, a página se atualiza sozinha.

- Catálogo: http://localhost:3000
- Login: link **Acesso da equipe**, no rodapé do catálogo
  (ou direto em http://localhost:3000/entrar)
- Conta de teste: `professor.teste@ufc.br` / `SenhaTeste2026`

Para criar outras contas de teste pelo terminal:

```
node scripts/criar_admin.js "Nome" email@exemplo.com professor
```

O papel pode ser `professor` ou `bolsista`. A senha provisória é mostrada uma
única vez no terminal. Também é possível criar contas pela tela **Contas**,
entrando como professor.

### Problemas comuns

| Sintoma                                                     | Causa provável                                                          |
| ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| Erro de senha ou `DATABASE_URL` indefinida ao iniciar       | O `.env` não foi salvo, está com outro nome ou com a senha errada       |
| `database "gepen" does not exist`                           | O banco não foi criado, ou foi criado com outro nome                    |
| `relation "..." does not exist`                             | Os scripts do banco não foram rodados, ou foram rodados no banco errado |
| A página não mostra uma mudança feita no código             | Cache do navegador: aperte `Ctrl + F5`                                  |
| `EADDRINUSE` na porta 3000                                  | O servidor já está aberto em outro terminal                             |
| `Cannot use import statement` ou erros estranhos ao iniciar | Node.js antigo: confira com `node --version`                            |
| `Cannot find package 'vite'` ou `'react'`                   | Faltou rodar `npm install` depois de baixar esta versão                 |

## Como navegar pelo código

### Estrutura de pastas

```
db/                    scripts SQL (schema, seed e dados de teste)
scripts/               ferramentas de linha de comando (criar_admin.js)
src/                   servidor (Express)
  server.js            configuração do servidor (ponto de partida)
  db.js                conexão com o banco
  middlewares/         requireAuth (está logado?) e requireProfessor (é professor?)
  routes/              rotas: auth, opcoes, cards e contas
  utils/               funções de validação
web/                   front-end (React)
  index.html           página única onde o React é montado
  public/              arquivos copiados como estão: img/, manifest e sw.js
  src/
    main.jsx           ponto de partida do React
    App.jsx            lista de endereços (rotas) e a tela de cada um
    roteador.jsx       troca de tela sem recarregar a página
    api.js             funções para conversar com o servidor
    util.js            funções pequenas (datas, busca sem acento...)
    style.css          estilos do site inteiro
    paginas/           uma tela por arquivo
    componentes/       peças reaproveitadas (cabeçalho, formulário, tags...)
    hooks/             lógica reaproveitada (sessão, listas do servidor...)
vite.config.js         configuração do Vite
dist/                  versão pronta para publicar (gerada por `npm run build`)
```

### Por onde começar a ler

1. **`db/01_schema.sql`**: as tabelas e como se ligam. Todo o resto depende delas.
2. **`src/server.js`**: a ordem em que o servidor monta tudo (sessão, proteção
   das rotas `/admin`, as rotas e, por último, o React).
3. **`web/src/App.jsx`**: os endereços do site e qual tela cada um abre.
4. **Um caminho completo**, do navegador ao banco. Por exemplo, o catálogo:
   `web/src/paginas/Catalogo.jsx` (faz `buscarLista("/cards")`) →
   `src/routes/cards.js` (rota `GET /cards`, que faz o `SELECT`) → banco.

Cada tela em `web/src/paginas/` conversa com as rotas de `src/routes/`:

| Endereço             | Tela                     | Rotas usadas                                            |
| -------------------- | ------------------------ | ------------------------------------------------------- |
| `/` (catálogo)       | `Catalogo.jsx`           | `routes/cards.js`, `routes/opcoes.js`                   |
| `/entrar`            | `Login.jsx`              | `routes/auth.js`                                        |
| `/painel`            | `Painel.jsx`             | `routes/cards.js`, `routes/opcoes.js`, `routes/auth.js` |
| `/painel/nova`       | `NovaRecomendacao.jsx`   | `routes/cards.js`, `routes/opcoes.js`                   |
| `/painel/editar/:id` | `EditarRecomendacao.jsx` | `routes/cards.js`, `routes/opcoes.js`                   |
| `/contas`            | `Contas.jsx`             | `routes/contas.js`                                      |
| `/senha`             | `Senha.jsx`              | `routes/auth.js`                                        |

Os endereços da versão antiga (`/login.html`, `/admin.html`...) redirecionam
para os novos.

## Aplicativo instalável (PWA)

O site pode ser instalado como aplicativo (no navegador do computador ou no
celular) e o catálogo abre mesmo sem internet, com as recomendações salvas
na última visita.

- `web/public/manifest.webmanifest`: nome, cores e ícones do aplicativo
- `web/public/sw.js`: o service worker. Tenta sempre a rede primeiro e usa o
  cache só quando a rede falha. As rotas `/admin`, login e logout nunca vão
  para o cache
- O registro do service worker fica em `web/src/main.jsx` e só acontece na
  versão publicada, para não guardar arquivos antigos durante o desenvolvimento

Para testar o PWA no computador, gere a versão publicada (`npm run build` e
depois `npm start`). No Chrome, abra as ferramentas de desenvolvedor (F12) →
aba **Application** → **Service workers** e **Manifest**. A opção **Offline**,
na aba **Network**, simula a falta de internet.

Ao mudar a lista de arquivos guardados no `sw.js`, troque a constante `VERSAO`.
O PWA só funciona em `localhost` ou em HTTPS.

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

- A primeira conta (professor) é criada pelo script `scripts/criar_admin.js`
- Qualquer professor pode criar professores e bolsistas
- Qualquer professor pode desativar bolsistas
- Somente o professor original (a primeira conta de professor) pode desativar
  outros professores
- Ninguém pode desativar a própria conta
- Contas desativadas não conseguem entrar, e suas sessões são encerradas
- Professores podem redefinir a senha de outras contas ativas, com as mesmas regras da desativação; a senha provisória é mostrada uma única vez e as sessões da conta são encerradas

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

## Decisões do projeto

| Decisão                            | Motivo                                                    |
| ---------------------------------- | --------------------------------------------------------- |
| Sessão com cookie em vez de JWT    | O logout precisa invalidar a sessão de verdade            |
| SQL direto, sem ORM                | Controle total das consultas e do schema                  |
| Tabela `administrador` com papel   | Permite professores e bolsistas com permissões diferentes |
| Tags vinculadas a uma categoria    | As tags aparecem conforme a categoria                     |
| Filtros com seleção única (select) | O catálogo tem poucas recomendações                       |
| Busca e filtros no navegador       | O catálogo é pequeno; os filtros ficam instantâneos       |
| Limite de tentativas na memória    | Mais simples, sem tabela nova                             |
| React com Vite no front-end        | Telas em componentes reaproveitáveis; Vite roda no Express em desenvolvimento |
| Roteador próprio, sem biblioteca   | Poucas telas; pode ser trocado por React Router se crescer |

## Banco de dados

7 tabelas: `administrador`, `tipo`, `categoria`, `nivel`, `tag`, `card` e
`card_tag` (mais a tabela `session`, criada automaticamente pela biblioteca de
sessões).

### Operações SQL da aplicação

| Operação | Funcionalidade                        | Onde                                 |
| -------- | ------------------------------------- | ------------------------------------ |
| `SELECT` | Login                                 | `routes/auth.js`                     |
| `SELECT` | Dados do usuário logado               | `routes/auth.js`                     |
| `SELECT` | Tipos, categorias, níveis e tags      | `routes/opcoes.js`                   |
| `SELECT` | Listagem do catálogo e do painel      | `routes/cards.js`                    |
| `SELECT` | Uma recomendação, para edição         | `routes/cards.js`                    |
| `SELECT` | Listagem de contas                    | `routes/contas.js`                   |
| `INSERT` | Cadastro de recomendação (`card`)     | `routes/cards.js`                    |
| `INSERT` | Tags da recomendação (`card_tag`)     | `routes/cards.js`                    |
| `INSERT` | Cadastro de conta (`administrador`)   | `routes/contas.js`                   |
| `UPDATE` | Alteração de senha                    | `routes/auth.js`                     |
| `UPDATE` | Edição de recomendação                | `routes/cards.js`                    |
| `UPDATE` | Desativação de conta                  | `routes/contas.js`                   |
| `UPDATE` | Redefinição de senha                  | `routes/contas.js`                   |
| `DELETE` | Exclusão de recomendação              | `routes/cards.js`                    |
| `DELETE` | Troca das tags na edição (`card_tag`) | `routes/cards.js`                    |
| `DELETE` | Encerramento de sessões               | `routes/auth.js`, `routes/contas.js` |

## Limitações conhecidas

- Os contadores do limite de tentativas ficam na memória e zeram quando o
  servidor reinicia
- Em redes compartilhadas (como a da universidade), várias pessoas usam o mesmo
  IP; erros de outras pessoas podem bloquear o login por até 5 minutos
- A disponibilidade dos links depende dos sites de origem
- A troca da senha provisória no primeiro acesso é uma orientação, e não é
  obrigatória pelo sistema
- As telas administrativas fazem parte do mesmo aplicativo React: sem login,
  o código chega ao navegador, mas os dados não carregam, porque as rotas
  `/admin` exigem sessão
- A busca e os filtros rodam no navegador; se o catálogo passar de alguns
  milhares de recomendações, a filtragem deve ir para o servidor

## Publicação

Para publicar, gere o front-end com `npm run build` (cria a pasta `dist/`) e
inicie o servidor com `npm start`. Ajustes necessários antes de publicar:

1. No `server.js`, ativar `app.set("trust proxy", 1)`
2. No cookie da sessão, usar `secure: true` (exige HTTPS)
3. Configurar na hospedagem as variáveis `DATABASE_URL` e `SESSION_SECRET`
4. No banco de produção, rodar somente `01_schema.sql` e `02_seed.sql`
5. Criar a conta do professor rodando `scripts/criar_admin.js` com a
   `DATABASE_URL` do banco de produção, e entregar a senha provisória ao
   professor por um canal seguro
6. Usar, no banco de produção, um usuário próprio da aplicação, com permissão
   apenas no banco do projeto

## Melhorias futuras

- Convite e recuperação de senha por e-mail
- Filtro por data (ano, mês e semana)
- Reativação de contas desativadas
- Criação automática da conta do professor na primeira inicialização do servidor
- Servir as páginas administrativas somente com login, pelo servidor
