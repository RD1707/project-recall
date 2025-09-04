import toast from 'react-hot-toast';

const handleApiError = async (response) => {
    const errorData = await response.json();
    console.error("Erro da API:", errorData);
    
    // Se o backend enviar um erro específico de campo, vamos usá-lo
    if (errorData.field && errorData.type === 'FIELD_ERROR') {
        throw errorData; 
    }

    const errorMessage = errorData.error || errorData.message || 'Ocorreu um erro desconhecido.';
    toast.error(errorMessage);
    throw new Error(errorMessage);
};

export const loginUser = async (credentials) => {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        const data = await response.json();
        
        // Armazenar a sessão no localStorage para que o Supabase JS SDK possa pegá-la
        if (data.session) {
            localStorage.setItem('sb-khofqsjwyunicxdxapih-auth-token', JSON.stringify(data.session));
        }

        return data;
    } catch (error) {
        // O erro já foi tratado e exibido pelo toast em handleApiError
        // Apenas relançamos para que o componente saiba que a chamada falhou
        throw error;
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        return await response.json();
    } catch (error) {
        // Relança o erro para ser pego no componente
        throw error;
    }
};

export const completeUserProfile = async (profileData) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Usuário não autenticado");

        const response = await fetch('/api/auth/complete-google-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(profileData),
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Falha ao completar o perfil.');
        }
        return data;
    } catch (error) {
        toast.error(error.message);
        throw error;
    }
};