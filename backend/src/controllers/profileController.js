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
}).strict();


const getProfile = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('points, current_streak, full_name, username, bio, avatar_url, has_completed_onboarding') 
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
                has_completed_onboarding: false, 
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
        const { full_name, username, bio, password } = profileUpdateSchema.parse(req.body);
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
        
        if (Object.keys(profileDataToUpdate).length > 0) {
            const { data: updatedProfile, error: profileError } = await supabase
                .from('profiles')
                .update(profileDataToUpdate)
                .eq('id', userId)
                .select('full_name, username, bio') 
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
    
    try {
        // Passo 1: Encontrar o perfil do utilizador pelo nome de utilizador
        // A coluna 'created_at' foi removida da linha seguinte
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, full_name, bio, avatar_url')
            .eq('username', username)
            .single();

        if (profileError || !profile) {
            return res.status(404).json({ message: 'Utilizador não encontrado.', code: 'USER_NOT_FOUND' });
        }
        
        // Passo 2: Buscar todos os baralhos públicos desse utilizador
        const { data: publicDecks, error: decksError } = await supabase
            .from('public_decks_with_ratings')
            .select('id, title, description, color, card_count, average_rating, rating_count')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false });

        if (decksError) throw decksError;

        // Passo 3: Combinar os dados e enviar a resposta
        const responsePayload = {
            profile: {
                username: profile.username,
                fullName: profile.full_name,
                bio: profile.bio,
                avatarUrl: profile.avatar_url
                // A propriedade memberSince foi removida daqui
            },
            decks: publicDecks
        };
        
        res.status(200).json(responsePayload);

    } catch (error) {
        logger.error(`Error fetching public profile for ${username}: ${error.message}`);
        res.status(500).json({ message: 'Erro ao buscar perfil público.', code: 'INTERNAL_SERVER_ERROR' });
    }
};
module.exports = { 
    getProfile, 
    updateProfile,
    getProfileByUsername,
    uploadAvatar,
    getLeaderboard,
    completeOnboarding,
    getPublicProfile
};