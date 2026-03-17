-- Execute este script no Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS marcas (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome       text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT marcas_nome_unique UNIQUE (nome)
);

-- Habilitar RLS
ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;

-- Leitura: todos os autenticados
CREATE POLICY "marcas_select" ON marcas
  FOR SELECT TO authenticated USING (true);

-- Inserção e deleção: apenas admin/operador (controlado na app)
CREATE POLICY "marcas_insert" ON marcas
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "marcas_delete" ON marcas
  FOR DELETE TO authenticated USING (true);

-- Inserir marcas iniciais comuns em TI
INSERT INTO marcas (nome) VALUES
  ('Apple'), ('Asus'), ('Acer'), ('Dell'), ('HP'),
  ('Lenovo'), ('LG'), ('Logitech'), ('Microsoft'), ('Multilaser'),
  ('Positivo'), ('Samsung'), ('Sony'), ('Xiaomi'), ('Generic')
ON CONFLICT (nome) DO NOTHING;
