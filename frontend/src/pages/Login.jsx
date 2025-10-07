import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../api/supabaseClient';
import { loginUser } from '../api/auth';
import ThemeToggle from '../components/common/ThemeToggle';

import '../assets/css/login.css';
import '../assets/css/ThemeToggle.css';

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

const GoogleIcon = () => (
    <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const passwordRef = useRef(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        setError('');
    };

const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        // Autentica o usuário diretamente com o Supabase
        const { error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
        });

        if (error) {
            // Se o Supabase retornar um erro (ex: senha errada), nós o exibimos.
            throw error;
        }

        // Se NÃO houve erro, a autenticação foi um sucesso.
        // O onAuthStateChange no ProtectedRoute já foi notificado.
        // Agora, nós explicitamente mandamos o usuário para o dashboard.
        toast.success('Login bem-sucedido!');
        navigate('/dashboard');

    } catch (err) {
        // Captura o erro do Supabase e o exibe para o usuário.
        setError(err.message || 'E-mail ou senha inválidos.');
    } finally {
        // Garante que o estado de loading seja desativado em qualquer cenário.
        setLoading(false);
    }
};

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({ 
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/dashboard'
                }
            });
            
            if (error) {
                toast.error(error.message || "Não foi possível conectar com o Google.");
            }
        } catch (err) {
            toast.error("Erro ao conectar com o Google.");
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="auth-layout">
            <AuthPromoPanel 
                title="Transforme anotações em conhecimento."
                subtitle="Junte-se a milhares de estudantes que estão aprendendo de forma mais rápida e eficiente com flashcards inteligentes."
            />

            <div className="auth-form-panel">
                <div className="form-container">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <ThemeToggle />
                    </div>
                    <div className="form-header">
                        <h1>Acesse sua conta</h1>
                        <p>Bem-vindo de volta! Por favor, insira seus dados.</p>
                    </div>

                    <div className="social-logins">
                        <button onClick={handleGoogleLogin} className="btn btn-social">
                            <GoogleIcon />
                            Entrar com Google
                        </button>
                    </div>
                    
                    <div className="separator"><span>OU</span></div>

                    <form onSubmit={handleLogin} noValidate>
                        <div className="form-group">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="seu@email.com"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Senha</label>
                            <div className="input-group">
                                <input
                                    ref={passwordRef}
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="form-control"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Sua senha"
                                />
                                <button type="button" className="password-toggle" onClick={togglePasswordVisibility} aria-label="Mostrar/ocultar senha">
                                    <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                </button>
                            </div>
                        </div>
                        
                        <div className="form-options">
                            <Link to="/forgot-password" className="forgot-password">Esqueceu a senha?</Link>
                        </div>
                        
                        {error && <p className="error-message">{error}</p>}
                        
                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <div className="toggle-panel">
                        <p>
                            Não tem uma conta?
                            <Link to="/register"> Registre-se agora</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;