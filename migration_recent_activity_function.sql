-- Migração para criar função get_recent_activity
-- Execute este SQL no editor SQL do Supabase para corrigir o erro de atividades recentes

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