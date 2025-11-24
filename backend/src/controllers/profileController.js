const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');
const { z } = require('zod');

const profileUpdateSchema = z.object({
    full_name: z.string().min(3, 'O nome completo deve ter pelo menos 3 caracteres.').optional(),
    username: z.string()
        .min(3, 'O nome de usuário deve ter pelo menos 3 caracteres.')
        .max(20, 'O nome de usuário deve ter no máximo 20 caracteres.')
        .regex(/^[a-zA-Z0-9_]+$/, 'Nome de usuário deve conter apenas letras, números e underscore.')
        .optional(),
    bio: z.string().max(160, 'A bio não pode exceder 160 caracteres.').optional().nullable(),
    password: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres.').optional(),
    interests: z.array(
        z.object({
            name: z.string().min(1, 'Nome do interesse é obrigatório.').max(50, 'Nome do interesse deve ter no máximo 50 caracteres.'),
            color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser um hex válido (ex: #FF5733).')
        })
    ).max(10, 'Máximo de 10 interesses permitidos.').optional(),
}).strict();

const deleteAccountSchema = z.object({
    password: z.string().min(1, 'A senha é obrigatória para confirmar a exclusão.'),
}).strict();


const getProfile = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('points, current_streak, full_name, username, bio, avatar_url, banner_url, has_completed_onboarding, interests')
            .eq('id', req.user.id)
            .single();

        if (error && error.code === 'PGRST116') {
            logger.warn(`Perfil não encontrado para o usuário ${req.user.id}. Retornando perfil padrão.`);
            return res.status(200).json({
                points: 0,
                current_streak: 0,
                full_name: '',
                username: '',
                bio: '',
                avatar_url: null,
                banner_url: null,
                has_completed_onboarding: false,
                interests: [],
                email: req.user.email
            });
        }
        
        if (error) throw error;
        
        res.status(200).json({ ...data, email: req.user.email });

    } catch (error) {
        logger.error(`Error fetching profile for user ${req.user.id}: ${error.message}`);
        res.status(500).json({ message: 'Erro ao buscar o perfil do usuário.', code: 'INTERNAL_SERVER_ERROR' });
    }
};

const updateProfile = async (req, res) => {
    const userId = req.user.id;
    try {
        const { full_name, username, bio, password, interests } = profileUpdateSchema.parse(req.body);
        let profileDataToUpdate = {};
        
        if (username) {
            const { data: existingUser } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', username)
                .neq('id', userId)
                .single();

            if (existingUser) {
                return res.status(400).json({ 
                    message: 'Este nome de usuário já está em uso.', 
                    code: 'USERNAME_TAKEN' 
                });
            }
            profileDataToUpdate.username = username;
        }
        
        if (password) {
            const { error: authError } = await supabase.auth.updateUser({ password });
            if (authError) throw new Error(`Erro ao atualizar senha: ${authError.message}`);
        }

        if (full_name !== undefined) profileDataToUpdate.full_name = full_name;
        if (bio !== undefined) profileDataToUpdate.bio = bio;
        if (interests !== undefined) profileDataToUpdate.interests = interests;
        
        if (Object.keys(profileDataToUpdate).length > 0) {
            const { data: updatedProfile, error: profileError } = await supabase
                .from('profiles')
                .update(profileDataToUpdate)
                .eq('id', userId)
                .select('full_name, username, bio, interests') 
                .single();
                
            if (profileError) throw new Error(`Erro ao atualizar perfil: ${profileError.message}`);
            
            return res.status(200).json({ 
              message: 'Perfil atualizado com sucesso!',
              profile: updatedProfile 
            });
        }
        
        res.status(200).json({ message: 'Nenhuma alteração detectada.' });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message, code: 'VALIDATION_ERROR' });
        }
        logger.error(`Error updating profile for user ${userId}: ${error.message}`);
        res.status(500).json({ message: 'Erro interno ao atualizar o perfil.', code: 'INTERNAL_SERVER_ERROR' });
    }
};

const uploadAvatar = async (req, res) => {
    const userId = req.user.id;

    if (!req.file) {
        return res.status(400).json({ message: 'Nenhum arquivo de imagem enviado.', code: 'VALIDATION_ERROR' });
    }

    try {
        const file = req.file;
        const filePath = `${userId}/${Date.now()}-${file.originalname}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(uploadData.path);

        const avatar_url = urlData.publicUrl;

        const { data: updatedProfile, error: profileError } = await supabase
            .from('profiles')
            .update({ avatar_url })
            .eq('id', userId)
            .select('avatar_url')
            .single();

        if (profileError) throw profileError;

        res.status(200).json({
            message: 'Avatar atualizado com sucesso!',
            avatarUrl: updatedProfile.avatar_url
        });

    } catch (error) {
        logger.error(`Erro no upload do avatar para o usuário ${userId}: ${error.message}`);
        res.status(500).json({ message: 'Erro ao fazer upload do avatar.', code: 'UPLOAD_ERROR' });
    }
};

const uploadBanner = async (req, res) => {
    const userId = req.user.id;

    if (!req.file) {
        return res.status(400).json({ message: 'Nenhum arquivo de imagem enviado.', code: 'VALIDATION_ERROR' });
    }

    try {
        const file = req.file;
        const filePath = `${userId}/${Date.now()}-${file.originalname}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('banners')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
            .from('banners')
            .getPublicUrl(uploadData.path);

        const banner_url = urlData.publicUrl;

        const { data: updatedProfile, error: profileError } = await supabase
            .from('profiles')
            .update({ banner_url })
            .eq('id', userId)
            .select('banner_url')
            .single();

        if (profileError) throw profileError;

        res.status(200).json({
            message: 'Banner atualizado com sucesso!',
            bannerUrl: updatedProfile.banner_url
        });

    } catch (error) {
        logger.error(`Erro no upload do banner para o usuário ${userId}: ${error.message}`);
        res.status(500).json({ message: 'Erro ao fazer upload do banner.', code: 'UPLOAD_ERROR' });
    }
};

const getProfileByUsername = async (req, res) => {
    const { username } = req.params;
    
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('username, full_name, points, current_streak')
            .eq('username', username)
            .single();

        if (error || !data) {
            return res.status(404).json({ message: 'Usuário não encontrado.', code: 'USER_NOT_FOUND' });
        }
        
        res.status(200).json(data);

    } catch (error) {
        logger.error(`Error fetching profile by username ${username}: ${error.message}`);
        res.status(500).json({ message: 'Erro ao buscar perfil.', code: 'INTERNAL_SERVER_ERROR' });
    }
};

const getLeaderboard = async (req, res) => {
    const { limit = 10, offset = 0 } = req.query;
    const period = req.query.period || 'all_time'; 
    
    try {
        let orderByColumn = 'points';
        let pointsColumn = 'points';

        if (period === 'weekly') {
            orderByColumn = 'weekly_points';
            pointsColumn = 'weekly_points';
        }

        const { data, error } = await supabase
            .from('profiles')
            .select(`username, full_name, avatar_url, ${pointsColumn}`)
            .order(orderByColumn, { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        
        const formattedData = data.map(profile => ({
            ...profile,
            points: profile[pointsColumn]
        }));
        
        res.status(200).json(formattedData);

    } catch (error) {
        logger.error(`Error fetching leaderboard: ${error.message}`);
        res.status(500).json({ message: 'Erro ao buscar ranking.', code: 'INTERNAL_SERVER_ERROR' });
    }
};

const completeOnboarding = async (req, res) => {
    const userId = req.user.id;
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ has_completed_onboarding: true })
            .eq('id', userId);

        if (error) throw error;

        res.status(200).json({ message: 'Onboarding concluído com sucesso!' });
    } catch (error) {
        logger.error(`Erro ao completar onboarding para o usuário ${userId}: ${error.message}`);
        res.status(500).json({ message: 'Erro interno ao salvar o status do onboarding.', code: 'INTERNAL_SERVER_ERROR' });
    }
};

const getPublicProfile = async (req, res) => {
    const { username } = req.params;

    if (!username || username.trim() === '') {
        logger.warn('Tentativa de acesso a perfil público sem username');
        return res.status(400).json({ message: 'Nome de usuário é obrigatório.', code: 'MISSING_USERNAME' });
    }

    try {
        const isProblematicUser = ['werkzin', 'homofobilson'].includes(username.toLowerCase());

        if (isProblematicUser) {
            logger.warn(`🔍 DEBUG: Investigando usuário problemático: ${username}`);
            console.log(`🔍 DEBUG: Investigando usuário problemático: ${username}`);
        }

        logger.info(`Buscando perfil público para username: ${username}`);

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, full_name, bio, avatar_url, banner_url, points, current_streak, interests')
            .eq('username', username)
            .single();

        if (profileError) {
            logger.warn(`Erro ao buscar perfil para ${username}: ${profileError.message} (código: ${profileError.code})`);

            if (isProblematicUser) {
                console.log(`🔍 DEBUG: ProfileError para ${username}:`, profileError);
            }

            if (profileError.code === 'PGRST116') {
                return res.status(404).json({ message: 'Perfil não encontrado.', code: 'USER_NOT_FOUND' });
            }

            throw profileError;
        }

        if (!profile) {
            logger.warn(`Perfil não encontrado para username: ${username}`);

            if (isProblematicUser) {
                console.log(`🔍 DEBUG: Profile null/undefined para ${username}`);
            }

            return res.status(404).json({ message: 'Perfil não encontrado.', code: 'USER_NOT_FOUND' });
        }

        if (isProblematicUser) {
            console.log(`🔍 DEBUG: Profile encontrado para ${username}:`, JSON.stringify(profile, null, 2));
        }
        
        logger.info(`Buscando decks públicos para o usuário ${profile.id} (username: ${username})`);

        const { data: publicDecks, error: decksError } = await supabase
            .from('decks')
            .select(`
                id,
                title,
                description,
                color,
                created_at,
                flashcards(count)
            `)
            .eq('user_id', profile.id)
            .eq('is_shared', true)
            .order('created_at', { ascending: false });

        if (decksError) {
            logger.error(`Erro ao buscar decks públicos para ${username} (${profile.id}): ${decksError.message}`);

            if (isProblematicUser) {
                console.log(`🔍 DEBUG: DecksError para ${username}:`, decksError);
            }

            throw decksError;
        }

        if (isProblematicUser) {
            console.log(`🔍 DEBUG: Decks encontrados para ${username}:`, publicDecks?.length || 0);
        }

        const deckIds = (publicDecks || []).map(deck => deck.id);
        let ratingsData = [];

        if (deckIds.length > 0) {
            const { data: ratings, error: ratingsError } = await supabase
                .from('deck_ratings')
                .select('deck_id, rating')
                .in('deck_id', deckIds);

            if (ratingsError) {
                logger.warn(`Error fetching ratings for public profile ${username}: ${ratingsError.message}`);
            } else {
                ratingsData = ratings || [];
            }
        }

        const ratingsMap = ratingsData.reduce((acc, rating) => {
            if (!acc[rating.deck_id]) {
                acc[rating.deck_id] = [];
            }
            acc[rating.deck_id].push(rating.rating);
            return acc;
        }, {});

        const formattedDecks = (publicDecks || []).map(deck => {
            const ratings = ratingsMap[deck.id] || [];
            const average_rating = ratings.length > 0
                ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
                : 0;
            const rating_count = ratings.length;

            return {
                ...deck,
                card_count: deck.flashcards?.[0]?.count || 0,
                average_rating: Math.round(average_rating * 10) / 10,
                rating_count,
                author: {
                    username: profile.username,
                    avatar_url: profile.avatar_url
                }
            };
        });

        const responsePayload = {
            profile: {
                username: profile.username || '',
                fullName: profile.full_name || '',
                bio: profile.bio || '',
                avatarUrl: profile.avatar_url || null,
                bannerUrl: profile.banner_url || null,
                points: profile.points || 0,
                currentStreak: profile.current_streak || 0,
                interests: profile.interests || [],
                totalPublicDecks: formattedDecks.length,
                totalPublicCards: formattedDecks.reduce((sum, deck) => sum + (deck.card_count || 0), 0)
            },
            decks: formattedDecks
        };

        logger.info(`Perfil público retornado com sucesso para ${username}: ${formattedDecks.length} decks encontrados`);

        if (isProblematicUser) {
            console.log(`🔍 DEBUG: ResponsePayload completo para ${username}:`, JSON.stringify(responsePayload, null, 2));
        }

        res.status(200).json(responsePayload);

    } catch (error) {
        logger.error(`Error fetching public profile for ${username}: ${error.message}`);
        res.status(500).json({ message: 'Erro ao buscar perfil público.', code: 'INTERNAL_SERVER_ERROR' });
    }
};

const deleteAccount = async (req, res) => {
    const userId = req.user.id;
    const userEmail = req.user.email;
    
    try {
        const { password } = deleteAccountSchema.parse(req.body);
        
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: password
        });

        if (authError) {
            return res.status(400).json({ 
                message: 'Senha incorreta. Não foi possível excluir a conta.', 
                code: 'INVALID_PASSWORD' 
            });
        }

        const tablesToClean = [
            'achievements',
            'study_sessions', 
            'flashcard_progress',
            'deck_ratings',
            'community_deck_ratings',
            'flashcards',
            'decks',
            'profiles'
        ];

        for (const table of tablesToClean) {
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('user_id', userId);
            
            if (error) {
                logger.warn(`Erro ao limpar tabela ${table} para usuário ${userId}: ${error.message}`);
            }
        }

        const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
        
        if (deleteAuthError) {
            logger.error(`Erro ao excluir usuário da autenticação ${userId}: ${deleteAuthError.message}`);
            return res.status(500).json({ 
                message: 'Erro ao excluir conta. Tente novamente.', 
                code: 'DELETE_ERROR' 
            });
        }

        logger.info(`Conta excluída com sucesso para o usuário ${userId} (${userEmail})`);
        res.status(200).json({ 
            message: 'Conta excluída com sucesso. Todos os seus dados foram removidos permanentemente.' 
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message, code: 'VALIDATION_ERROR' });
        }
        logger.error(`Erro ao excluir conta para o usuário ${userId}: ${error.message}`);
        res.status(500).json({ 
            message: 'Erro interno ao excluir a conta. Tente novamente.', 
            code: 'INTERNAL_SERVER_ERROR' 
        });
    }
};

const getRecentActivity = async (req, res) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || 10;

    try {
        const { data, error } = await supabase.rpc('get_recent_activity', {
            user_id_param: userId,
            limit_param: limit
        });

        if (error) throw error;

        const formattedActivities = data.map(activity => ({
            type: activity.activity_type,
            text: activity.activity_text,
            icon: activity.activity_icon,
            time: activity.activity_time,
            details: activity.activity_details
        }));

        res.status(200).json(formattedActivities);
    } catch (error) {
        logger.error(`Error fetching recent activity for user ${userId}: ${error.message}`);
        res.status(500).json({ message: 'Erro ao buscar atividade recente.', code: 'INTERNAL_SERVER_ERROR' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getProfileByUsername,
    uploadAvatar,
    uploadBanner,
    getLeaderboard,
    completeOnboarding,
    getPublicProfile,
    deleteAccount,
    getRecentActivity
};