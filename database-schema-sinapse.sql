-- ============================================
-- SINAPSE AI CHAT - DATABASE SCHEMA
-- ============================================
-- Este script cria as tabelas necessárias para o sistema de chat com IA Sinapse
-- Execute este script no SQL Editor do Supabase
--
-- Versão: 1.0
-- Data: 2025-10-07
-- ============================================

-- Tabela: sinapse_conversations
-- Descrição: Armazena as conversas entre usuários e a IA Sinapse
CREATE TABLE IF NOT EXISTS sinapse_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Nova Conversa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_sinapse_conversations_user_id ON sinapse_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_sinapse_conversations_updated_at ON sinapse_conversations(updated_at DESC);

-- Comentários nas colunas
COMMENT ON TABLE sinapse_conversations IS 'Armazena as conversas entre usuários e a IA Sinapse';
COMMENT ON COLUMN sinapse_conversations.id IS 'ID único da conversa';
COMMENT ON COLUMN sinapse_conversations.user_id IS 'ID do usuário dono da conversa';
COMMENT ON COLUMN sinapse_conversations.title IS 'Título da conversa (gerado automaticamente pela IA)';
COMMENT ON COLUMN sinapse_conversations.created_at IS 'Data de criação da conversa';
COMMENT ON COLUMN sinapse_conversations.updated_at IS 'Data da última atualização da conversa';

-- ============================================

-- Tabela: sinapse_messages
-- Descrição: Armazena as mensagens individuais de cada conversa
CREATE TABLE IF NOT EXISTS sinapse_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES sinapse_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('USER', 'ASSISTANT')),
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_sinapse_messages_conversation_id ON sinapse_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_sinapse_messages_created_at ON sinapse_messages(created_at);

-- Comentários nas colunas
COMMENT ON TABLE sinapse_messages IS 'Armazena as mensagens individuais de cada conversa com a Sinapse';
COMMENT ON COLUMN sinapse_messages.id IS 'ID único da mensagem';
COMMENT ON COLUMN sinapse_messages.conversation_id IS 'ID da conversa à qual a mensagem pertence';
COMMENT ON COLUMN sinapse_messages.role IS 'Papel do autor da mensagem: USER (usuário) ou ASSISTANT (Sinapse)';
COMMENT ON COLUMN sinapse_messages.content IS 'Conteúdo da mensagem';
COMMENT ON COLUMN sinapse_messages.attachments IS 'Array JSON com informações dos arquivos anexados (nome, tipo, url, etc)';
COMMENT ON COLUMN sinapse_messages.created_at IS 'Data de criação da mensagem';

-- ============================================

-- Função: Atualizar updated_at automaticamente
-- Descrição: Trigger para atualizar o campo updated_at automaticamente quando uma nova mensagem é adicionada
CREATE OR REPLACE FUNCTION update_sinapse_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sinapse_conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_sinapse_conversation_timestamp ON sinapse_messages;
CREATE TRIGGER trigger_update_sinapse_conversation_timestamp
    AFTER INSERT ON sinapse_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_sinapse_conversation_timestamp();

-- ============================================

-- Row Level Security (RLS) Policies
-- Garante que usuários só possam acessar suas próprias conversas

-- Habilitar RLS nas tabelas
ALTER TABLE sinapse_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sinapse_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas suas próprias conversas
CREATE POLICY "Usuários podem ver suas próprias conversas"
    ON sinapse_conversations
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Usuários podem criar suas próprias conversas
CREATE POLICY "Usuários podem criar suas próprias conversas"
    ON sinapse_conversations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar suas próprias conversas
CREATE POLICY "Usuários podem atualizar suas próprias conversas"
    ON sinapse_conversations
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem deletar suas próprias conversas
CREATE POLICY "Usuários podem deletar suas próprias conversas"
    ON sinapse_conversations
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policy: Usuários podem ver mensagens de suas próprias conversas
CREATE POLICY "Usuários podem ver mensagens de suas conversas"
    ON sinapse_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM sinapse_conversations
            WHERE sinapse_conversations.id = sinapse_messages.conversation_id
            AND sinapse_conversations.user_id = auth.uid()
        )
    );

-- Policy: Usuários podem criar mensagens em suas próprias conversas
CREATE POLICY "Usuários podem criar mensagens em suas conversas"
    ON sinapse_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM sinapse_conversations
            WHERE sinapse_conversations.id = sinapse_messages.conversation_id
            AND sinapse_conversations.user_id = auth.uid()
        )
    );

-- Policy: Usuários podem deletar mensagens de suas próprias conversas
CREATE POLICY "Usuários podem deletar mensagens de suas conversas"
    ON sinapse_messages
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM sinapse_conversations
            WHERE sinapse_conversations.id = sinapse_messages.conversation_id
            AND sinapse_conversations.user_id = auth.uid()
        )
    );

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Para verificar se as tabelas foram criadas corretamente, execute:
-- SELECT * FROM sinapse_conversations LIMIT 1;
-- SELECT * FROM sinapse_messages LIMIT 1;

-- Para visualizar as policies criadas:
-- SELECT * FROM pg_policies WHERE tablename IN ('sinapse_conversations', 'sinapse_messages');
