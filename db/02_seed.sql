INSERT INTO tipo (nome) VALUES
    ('Livro'),
    ('Apostila'),
    ('Vídeo'),
    ('Áudio'),
    ('Artigo'),
    ('Site'),
    ('Aplicativo'),
    ('Curso'),
    ('Exercício'),
    ('Jogo'),
    ('Outro')

ON CONFLICT (LOWER(nome)) DO NOTHING;

INSERT INTO categoria (nome) VALUES
    ('Gramática'),
    ('Vocabulário'),
    ('Sistema de Escrita'),
    ('Leitura'),
    ('Escrita'),
    ('Compreensão Auditiva'),
    ('Conversação'),
    ('Cultura Japonesa'),
    ('Literatura Japonesa'),
    ('Aprendizado Geral')
    
    ON CONFLICT (LOWER(nome)) DO NOTHING;

INSERT INTO nivel (nome, ordem) VALUES
    ('N5', 1),
    ('N4', 2),
    ('N3', 3),
    ('N2', 4),
    ('N1', 5),
    ('Todos os Níveis', 6)
    
    ON CONFLICT (LOWER(nome)) DO NOTHING;

INSERT INTO tag (nome, categoria_id) VALUES
-- Gramática
    ('Partículas', (SELECT id FROM categoria WHERE LOWER(nome) = 'gramática')),
    ('Verbos', (SELECT id FROM categoria WHERE LOWER(nome) = 'gramática')),
    ('Adjetivos', (SELECT id FROM categoria WHERE LOWER(nome) = 'gramática')),
    ('Conjugação', (SELECT id FROM categoria WHERE LOWER(nome) = 'gramática')),
    ('Estrutura de Frases', (SELECT id FROM categoria WHERE LOWER(nome) = 'gramática')),
    ('Tempo Verbal', (SELECT id FROM categoria WHERE LOWER(nome) = 'gramática')),

-- Vocabulário
    ('Números', (SELECT id FROM categoria WHERE LOWER(nome) = 'vocabulário')),
    ('Cores', (SELECT id FROM categoria WHERE LOWER(nome) = 'vocabulário')),
    ('Família', (SELECT id FROM categoria WHERE LOWER(nome) = 'vocabulário')),
    ('Alimentos', (SELECT id FROM categoria WHERE LOWER(nome) = 'vocabulário')),
    ('Animais', (SELECT id FROM categoria WHERE LOWER(nome) = 'vocabulário')),
    ('Saudações', (SELECT id FROM categoria WHERE LOWER(nome) = 'vocabulário')),

-- Sistemas de Escrita
    ('Hiragana', (SELECT id FROM categoria WHERE LOWER(nome) = 'sistema de escrita')),
    ('Katakana', (SELECT id FROM categoria WHERE LOWER(nome) = 'sistema de escrita')),
    ('Radicais', (SELECT id FROM categoria WHERE LOWER(nome) = 'sistema de escrita')),
    ('Leituras Onyomi', (SELECT id FROM categoria WHERE LOWER(nome) = 'sistema de escrita')),
    ('Leituras Kunyomi', (SELECT id FROM categoria WHERE LOWER(nome) = 'sistema de escrita')),

-- Leitura
    ('Interpretação de Texto', (SELECT id FROM categoria WHERE LOWER(nome) = 'leitura')),
    ('Mangá', (SELECT id FROM categoria WHERE LOWER(nome) = 'leitura')),
    ('Contos', (SELECT id FROM categoria WHERE LOWER(nome) = 'leitura')),
    ('Notícias', (SELECT id FROM categoria WHERE LOWER(nome) = 'leitura')),

-- Escrita
    ('Produção Textual', (SELECT id FROM categoria WHERE LOWER(nome) = 'escrita')),
    ('Caligrafia', (SELECT id FROM categoria WHERE LOWER(nome) = 'escrita')),
    ('Redação', (SELECT id FROM categoria WHERE LOWER(nome) = 'escrita')),

-- Compreensão Auditiva
    ('Diálogos Cotidianos', (SELECT id FROM categoria WHERE LOWER(nome) = 'compreensão auditiva')),
    ('Pronúncia', (SELECT id FROM categoria WHERE LOWER(nome) = 'compreensão auditiva')),
    ('Escuta', (SELECT id FROM categoria WHERE LOWER(nome) = 'compreensão auditiva')),

-- Conversação
    ('Apresentação Pessoal', (SELECT id FROM categoria WHERE LOWER(nome) = 'conversação')),
    ('Situações Cotidianas', (SELECT id FROM categoria WHERE LOWER(nome) = 'conversação')),
    ('Perguntas e Respostas', (SELECT id FROM categoria WHERE LOWER(nome) = 'conversação')),

-- Cultura Japonesa
    ('Festivais', (SELECT id FROM categoria WHERE LOWER(nome) = 'cultura japonesa')),
    ('Gastronomia', (SELECT id FROM categoria WHERE LOWER(nome) = 'cultura japonesa')),
    ('Etiqueta', (SELECT id FROM categoria WHERE LOWER(nome) = 'cultura japonesa')),
    ('História', (SELECT id FROM categoria WHERE LOWER(nome) = 'cultura japonesa')),
    ('Anime', (SELECT id FROM categoria WHERE LOWER(nome) = 'cultura japonesa')),
    ('Mangá', (SELECT id FROM categoria WHERE LOWER(nome) = 'cultura japonesa')),

-- Literatura Japonesa
    ('Haiku', (SELECT id FROM categoria WHERE LOWER(nome) = 'literatura japonesa')),
    ('Contos Japoneses', (SELECT id FROM categoria WHERE LOWER(nome) = 'literatura japonesa')),
    ('Literatura Clássica', (SELECT id FROM categoria WHERE LOWER(nome) = 'literatura japonesa')),
    ('Literatura Contemporânea', (SELECT id FROM categoria WHERE LOWER(nome) = 'literatura japonesa')),

-- Aprendizado Geral
    ('JLPT', (SELECT id FROM categoria WHERE LOWER(nome) = 'aprendizado geral')),
    ('Autodidatismo', (SELECT id FROM categoria WHERE LOWER(nome) = 'aprendizado geral')),
    ('Métodos de Estudo', (SELECT id FROM categoria WHERE LOWER(nome) = 'aprendizado geral'))
    
    ON CONFLICT (categoria_id, LOWER(f_unaccent(nome))) DO NOTHING;