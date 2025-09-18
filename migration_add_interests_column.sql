-- Migração para adicionar coluna de interesses na tabela profiles
-- Execute este SQL no editor SQL do Supabase

-- Adicionar coluna de interesses na tabela profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]'::jsonb;

-- Comentário da coluna para documentação
COMMENT ON COLUMN profiles.interests IS 'Lista de interesses do usuário armazenados como JSON array com objetos contendo name e color';

-- Opcional: Criar índice para busca eficiente por interesses
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON profiles USING gin(interests);