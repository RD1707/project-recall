import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { requestPasswordReset } from '../api/auth';
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

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            toast.error('Por favor, insira seu e-mail.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Por favor, insira um e-mail válido.');
            return;
        }

        setLoading(true);

        try {
            await requestPasswordReset(email);
            setSent(true);
            toast.success('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
        } catch (error) {
            toast.error('Erro ao enviar e-mail de recuperação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="auth-layout">
                <AuthPromoPanel 
                    title="E-mail enviado com sucesso!"
                    subtitle="Verifique sua caixa de entrada e spam para encontrar o link de recuperação de senha."
                />

                <div className="auth-form-panel">
                    <div className="form-container">
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <ThemeToggle />
                        </div>
                        <div className="form-header">
                            <div className="success-icon">
                                <i className="fas fa-envelope-circle-check"></i>
                            </div>
                            <h1>Verifique seu e-mail</h1>
                            <p>Enviamos um link de recuperação para <strong>{email}</strong></p>
                        </div>

                        <div className="form-content">
                            <div className="info-box">
                                <h3>Próximos passos:</h3>
                                <ol>
                                    <li>Acesse sua caixa de entrada</li>
                                    <li>Procure por um e-mail do Recall</li>
                                    <li>Clique no link "Redefinir senha"</li>
                                    <li>Crie sua nova senha</li>
                                </ol>
                            </div>

                            <p className="help-text">
                                Não recebeu o e-mail? Verifique sua pasta de spam ou tente novamente em alguns minutos.
                            </p>
                        </div>

                        <div className="form-actions">
                            <button 
                                onClick={() => setSent(false)} 
                                className="btn btn-secondary btn-full"
                            >
                                Enviar novamente
                            </button>
                            <Link to="/login" className="btn btn-primary btn-full">
                                Voltar ao Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-layout">
            <AuthPromoPanel 
                title="Recupere sua conta"
                subtitle="Digite seu e-mail e enviaremos um link para você redefinir sua senha de forma segura."
            />

            <div className="auth-form-panel">
                <div className="form-container">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <ThemeToggle />
                    </div>
                    <div className="form-header">
                        <h1>Esqueceu a senha?</h1>
                        <p>Não se preocupe! Digite seu e-mail e enviaremos as instruções para recuperar sua conta.</p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                disabled={loading}
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="btn btn-primary btn-full" 
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Enviando...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane"></i> Enviar Link de Recuperação
                                </>
                            )}
                        </button>
                    </form>

                    <div className="toggle-panel">
                        <p>
                            Lembrou da senha?
                            <Link to="/login"> Fazer login</Link>
                        </p>
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

export default ForgotPassword;