-- Função SQL para buscar resumo de analytics mais completo
-- Execute este SQL no editor SQL do Supabase

CREATE OR REPLACE FUNCTION get_complete_analytics_summary(user_id_param uuid)
RETURNS TABLE (
    total_reviews bigint,
    average_accuracy numeric,
    mastered_cards bigint,
    best_streak integer,
    total_decks bigint,
    total_cards bigint,
    total_study_time integer
)
LANGUAGE sql
AS $$
    WITH user_stats AS (
        -- Estatísticas de revisões
        SELECT
            COUNT(*) as review_count,
            COALESCE(AVG(quality), 0) * 20 as avg_accuracy  -- Convertendo de 0-5 para 0-100
        FROM review_history
        WHERE user_id = user_id_param
    ),
    mastered AS (
        -- Cartões masterizados (cards com ease_factor alto ou interval longo)
        SELECT COUNT(*) as mastered_count
        FROM flashcards f
        INNER JOIN decks d ON f.deck_id = d.id
        WHERE d.user_id = user_id_param
        AND (f.ease_factor >= 2.5 OR f.interval >= 30)
    ),
    user_decks AS (
        -- Total de decks do usuário
        SELECT COUNT(*) as deck_count
        FROM decks
        WHERE user_id = user_id_param
    ),
    user_cards AS (
        -- Total de cartões do usuário
        SELECT COUNT(*) as card_count
        FROM flashcards f
        INNER JOIN decks d ON f.deck_id = d.id
        WHERE d.user_id = user_id_param
    ),
    streak_data AS (
        -- Melhor sequência do usuário
        SELECT COALESCE(MAX(current_streak), 0) as max_streak
        FROM profiles
        WHERE id = user_id_param
    ),
    study_time AS (
        -- Tempo total de estudo (estimativa baseada em revisões)
        -- Assumindo 30 segundos por revisão em média
        SELECT COUNT(*) * 0.5 as total_minutes  -- 30 segundos = 0.5 minutos
        FROM review_history
        WHERE user_id = user_id_param
    )
    SELECT
        us.review_count,
        ROUND(us.avg_accuracy, 1),
        m.mastered_count,
        sd.max_streak,
        ud.deck_count,
        uc.card_count,
        ROUND(st.total_minutes)::integer
    FROM user_stats us
    CROSS JOIN mastered m
    CROSS JOIN user_decks ud
    CROSS JOIN user_cards uc
    CROSS JOIN streak_data sd
    CROSS JOIN study_time st;
$$;

-- Também vamos manter a função original para compatibilidade
-- mas redirecionando para a nova
CREATE OR REPLACE FUNCTION get_analytics_summary(user_id_param uuid)
RETURNS TABLE (
    total_reviews bigint,
    average_accuracy numeric,
    mastered_cards bigint,
    max_streak integer,
    total_decks bigint,
    total_cards bigint,
    best_streak integer,
    total_study_time integer
)
LANGUAGE sql
AS $$
    SELECT
        total_reviews,
        average_accuracy,
        mastered_cards,
        best_streak as max_streak,
        total_decks,
        total_cards,
        best_streak,
        total_study_time
    FROM get_complete_analytics_summary(user_id_param);
$$;

-- Função para buscar atividade recente do usuário
CREATE OR REPLACE FUNCTION get_recent_activity(user_id_param uuid, limit_param integer DEFAULT 10)
RETURNS TABLE (
    activity_type text,
    activity_text text,
    activity_icon text,
    activity_time timestamp with time zone,
    activity_details jsonb
)
LANGUAGE sql
AS $$
    WITH achievements_activity AS (
        SELECT
            'achievement' as type,
            'Desbloqueou conquista: ' || a.name as text,
            'fas fa-trophy' as icon,
            ua.unlocked_at as time,
            jsonb_build_object(
                'achievement_name', a.name,
                'achievement_description', a.description
            ) as details
        FROM user_achievements ua
        INNER JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = user_id_param
        AND ua.unlocked_at IS NOT NULL
        AND ua.unlocked_at >= NOW() - INTERVAL '30 days'
    ),
    deck_creation_activity AS (
        SELECT
            'deck_created' as type,
            'Criou o baralho: ' || title as text,
            'fas fa-layer-group' as icon,
            created_at as time,
            jsonb_build_object(
                'deck_id', id,
                'deck_title', title
            ) as details
        FROM decks
        WHERE user_id = user_id_param
        AND created_at >= NOW() - INTERVAL '30 days'
    ),
    study_activity AS (
        SELECT
            'study_session' as type,
            'Completou ' || COUNT(*) || ' revisões' as text,
            'fas fa-book' as icon,
            DATE_TRUNC('day', created_at) as time,
            jsonb_build_object(
                'review_count', COUNT(*),
                'average_quality', ROUND(AVG(quality), 1)
            ) as details
        FROM review_history
        WHERE user_id = user_id_param
        AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', created_at)
        HAVING COUNT(*) >= 5  -- Só mostrar dias com pelo menos 5 revisões
    ),
    all_activities AS (
        SELECT * FROM achievements_activity
        UNION ALL
        SELECT * FROM deck_creation_activity
        UNION ALL
        SELECT * FROM study_activity
    )
    SELECT
        type,
        text,
        icon,
        time,
        details
    FROM all_activities
    ORDER BY time DESC
    LIMIT limit_param;
$$;