import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../api/supabaseClient';
import { completeUserProfile } from '../api/auth';

import '../assets/css/login.css';

const AuthPromoPanel = ({ title, subtitle }) => (
    <div className="auth-promo-panel">
        <div className="promo-content">
            <Link to="/" className="promo-logo">
                <i className="fas fa-brain"></i> Recall
            </Link>
            <h2 className="promo-title">{title}</h2>
            <p className="promo-subtitle">{subtitle}</p>
        </div>
    </div>
);


function CompleteProfile() {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({ fullName: '', username: '' });
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    navigate('/login');
                    return;
                }

                // Verificar se o usuário já tem um perfil completo
                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('username, full_name, avatar_url')
                    .eq('id', session.user.id)
                    .single();

                // Se já tem username, redirecionar para dashboard
                if (existingProfile?.username) {
                    navigate('/dashboard');
                    return;
                }

                setUser(session.user);
                setFormData({
                    fullName: session.user.user_metadata?.full_name || existingProfile?.full_name || '',
                    username: ''
                });
            } catch (error) {
                toast.error("Não foi possível carregar sua sessão.");
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        if (errors[id]) {
            setErrors(prev => ({ ...prev, [id]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
            newErrors.username = 'Usuário deve ter 3-20 caracteres (letras, números ou _).';
        }
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'O nome completo é obrigatório.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setErrors({});
        
        try {
            await completeUserProfile({
                fullName: formData.fullName,
                username: formData.username
            });
            toast.success('Perfil completo! Bem-vindo ao Recall.');
            navigate('/dashboard');
        } catch (err) {
            if (err.field === 'username') {
                setErrors({ username: err.message });
            } else {
                toast.error(err.message || "Ocorreu um erro ao salvar o perfil.");
            }
        } finally {
            setLoading(false);
        }
    };
    
    if (loading && !user) {
        return <div>Carregando sua sessão...</div>;
    }
    
    if (!user) {
        return null; 
    }

    return (
        <div className="auth-layout">
            <AuthPromoPanel 
                title="Quase lá!"
                subtitle="Só precisamos de mais alguns detalhes para personalizar sua experiência de estudo."
            />
            <div className="auth-form-panel">
                <div className="form-container">
                    <div className="form-header">
                        <h1>Complete seu Perfil</h1>
                        <p>Conectado como: <strong>{user.email}</strong></p>
                        {(user.user_metadata?.avatar_url || user.user_metadata?.picture) && (
                            <div style={{ textAlign: 'center', margin: '20px 0' }}>
                                <img
                                    src={user.user_metadata.avatar_url || user.user_metadata.picture}
                                    alt="Foto do Google"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '3px solid var(--primary-color, #007bff)'
                                    }}
                                />
                                <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                                    Foto importada do Google
                                </p>
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="fullName">Nome Completo</label>
                            <input 
                                type="text" 
                                id="fullName" 
                                className={`form-control ${errors.fullName ? 'error' : ''}`} 
                                required 
                                value={formData.fullName} 
                                onChange={handleChange} 
                            />
                            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="username">Nome de Usuário</label>
                            <input 
                                type="text" 
                                id="username" 
                                className={`form-control ${errors.username ? 'error' : ''}`} 
                                required 
                                value={formData.username} 
                                onChange={handleChange} 
                            />
                             {errors.username ? (
                                <span className="field-error">{errors.username}</span>
                             ) : (
                                <small style={{ marginTop: '4px', display: 'block' }}>Será seu nome público no Recall.</small>
                             )}
                        </div>
                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Salvando...' : 'Finalizar Cadastro'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CompleteProfile;