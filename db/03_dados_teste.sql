-- Somente para desenvolvimento
-- Rodar uma única vez, depois do schema.sql e do seed.sql. **IMPORTANTE**
-- Login de teste: professor.teste@ufc.br / SenhaTeste2026

INSERT INTO administrador (nome, email, senha_hash, papel) VALUES
  ('Professor Teste', 'professor.teste@ufc.br',
   crypt('SenhaTeste2026', gen_salt('bf', 10)), 'professor')
ON CONFLICT DO NOTHING;

INSERT INTO card
  (administrador_id, tipo_id, categoria_id, nivel_id, titulo, url, descricao, idioma, observacoes)
VALUES
  (
    (SELECT id FROM administrador WHERE email = 'professor.teste@ufc.br'),
    (SELECT id FROM tipo WHERE nome = 'Vídeo'),
    (SELECT id FROM categoria WHERE nome = 'Gramática'),
    (SELECT id FROM nivel WHERE nome = 'N5'),
    'Partículas は e が: quando usar cada uma',
    'https://www.youtube.com/watch?v=X5tPdlmTplU&t=5s',
    'Videoaula curta com dicas sobre o uso das partículas は e が, com exemplos do dia a dia.',
    'Português',
    'Assista depois da aula 2.'
  ),
  (
    (SELECT id FROM administrador WHERE email = 'professor.teste@ufc.br'),
    (SELECT id FROM tipo WHERE nome = 'Site'),
    (SELECT id FROM categoria WHERE nome = 'Sistema de Escrita'),
    (SELECT id FROM nivel WHERE nome = 'N4'),
    'Lista de kanji do JLPT N4',
    'https://jlptsensei.com/jlpt-n4-kanji-list/',
    'Os kanji cobrados no nível N4, com leituras e exemplos.',
    'Inglês',
    NULL
  ),
  (
    (SELECT id FROM administrador WHERE email = 'professor.teste@ufc.br'),
    (SELECT id FROM tipo WHERE nome = 'Vídeo'),
    (SELECT id FROM categoria WHERE nome = 'Gramática'),
    (SELECT id FROM nivel WHERE nome = 'Todos os Níveis'),
    'Lista de 50 adjetivos mais comuns',
    'https://www.youtube.com/watch?v=jQ4q4uRblQg',
    'Vídeo com os 50 adjetivos mais comuns da língua japonesa.',
    'Português',
    NULL
  ),
  (
    (SELECT id FROM administrador WHERE email = 'professor.teste@ufc.br'),
    (SELECT id FROM tipo WHERE nome = 'Apostila'),
    (SELECT id FROM categoria WHERE nome = 'Sistema de Escrita'),
    (SELECT id FROM nivel WHERE nome = 'N5'),
    'Apostila sobre Hiragana',
    'https://www.tofugu.com/japanese/learn-hiragana-book-pdf/',
    'Apostila de hiragana, com exercícios de escrita.',
    'Inglês',
    'Boa para revisar antes da primeira prova.'
  ),
  (
    (SELECT id FROM administrador WHERE email = 'professor.teste@ufc.br'),
    (SELECT id FROM tipo WHERE nome = 'Curso'),
    (SELECT id FROM categoria WHERE nome = 'Aprendizado Geral'),
    (SELECT id FROM nivel WHERE nome = 'Todos os Níveis'),
    'Lições variadas de japonês',
    'https://www.br.emb-japan.go.jp/itpr_pt/curso_online.html',
    'Página da Embaixada do Japão com minicursos de japonês de níveis variados.',
    'Português',
    NULL
  ),
  (
    (SELECT id FROM administrador WHERE email = 'professor.teste@ufc.br'),
    (SELECT id FROM tipo WHERE nome = 'Site'),
    (SELECT id FROM categoria WHERE nome = 'Leitura'),
    (SELECT id FROM nivel WHERE nome = 'N4'),
    'NHK News Web Easy: notícias em japonês simples',
    'https://www3.nhk.or.jp/news/easy/',
    'Notícias reais escritas em japonês simplificado, com furigana.',
    'Japonês',
    'Leia uma notícia por semana.'
  );

INSERT INTO card_tag (card_id, tag_id)
SELECT c.id, t.id
FROM card c, tag t, categoria cat
WHERE t.categoria_id = cat.id
  AND (
    (c.titulo = 'Partículas は e が: quando usar cada uma'
       AND cat.nome = 'Gramática' AND t.nome IN ('Partículas', 'Estrutura de Frases'))
    OR
    (c.titulo = 'Lista de kanji do JLPT N4'
       AND cat.nome = 'Sistema de Escrita' AND t.nome IN ('Radicais', 'Leituras Onyomi', 'Leituras Kunyomi'))
    OR
    (c.titulo = 'Lista de 50 adjetivos mais comuns'
       AND cat.nome = 'Gramática' AND t.nome IN ('Adjetivos'))
    OR
    (c.titulo = 'Apostila sobre Hiragana'
       AND cat.nome = 'Sistema de Escrita' AND t.nome IN ('Hiragana'))
    OR
    (c.titulo = 'Lições variadas de japonês'
       AND cat.nome = 'Aprendizado Geral' AND t.nome IN ('Métodos de Estudo', 'Autodidatismo'))
    OR
    (c.titulo = 'NHK News Web Easy: notícias em japonês simples'
       AND cat.nome = 'Leitura' AND t.nome IN ('Notícias', 'Interpretação de Texto'))
  );
