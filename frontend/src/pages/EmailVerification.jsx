import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../api/supabaseClient';
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

function EmailVerification() {
    const [email, setEmail] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isChecking, setIsChecking] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const intervalRef = useRef(null);
    const authSubscriptionRef = useRef(null);

    useEffect(() => {
        // Verifica se veio da confirmação
        const verified = searchParams.get('verified');
        if (verified === 'true') {
            toast.success('Email verificado com sucesso!');
            navigate('/dashboard');
            return;
        }

        // Pega o email da localização state ou do localStorage
        const emailFromState = location.state?.email;
        const emailFromStorage = localStorage.getItem('pendingVerificationEmail');

        if (emailFromState) {
            setEmail(emailFromState);
            localStorage.setItem('pendingVerificationEmail', emailFromState);
        } else if (emailFromStorage) {
            setEmail(emailFromStorage);
        } else {
            // Se não tem email, redireciona para login
            navigate('/login');
            return;
        }

        // Verifica se o usuário já foi verificado
        checkVerificationStatus();

        // Configura listener para mudanças na autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
                clearPolling();
                localStorage.removeItem('pendingVerificationEmail');
                toast.success('Email verificado com sucesso!');
                navigate('/dashboard');
            }
        });

        authSubscriptionRef.current = subscription;

        // Inicia polling inteligente
        startPolling();

        return () => {
            clearPolling();
            if (authSubscriptionRef.current) {
                authSubscriptionRef.current.unsubscribe();
            }
        };
    }, [navigate, location.state, searchParams]);

    const checkVerificationStatus = async () => {
        if (isChecking) return;

        try {
            setIsChecking(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.email_confirmed_at) {
                // Usuário já foi verificado, redireciona para dashboard
                clearPolling();
                localStorage.removeItem('pendingVerificationEmail');
                toast.success('Email verificado com sucesso!');
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Erro ao verificar status:', error);
        } finally {
            setIsChecking(false);
        }
    };

    const startPolling = () => {
        // Polling a cada 5 segundos
        intervalRef.current = setInterval(() => {
            checkVerificationStatus();
        }, 5000);
    };

    const clearPolling = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // Detecta quando a página fica visível/invisível para otimizar polling
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                clearPolling();
            } else {
                startPolling();
                checkVerificationStatus(); // Verifica imediatamente quando volta
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Detecta quando a janela ganha foco para verificar imediatamente
    useEffect(() => {
        const handleFocus = () => {
            checkVerificationStatus();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const handleResendEmail = async () => {
        if (resendCooldown > 0) return;

        setResendLoading(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email
            });

            if (error) {
                toast.error(error.message || 'Erro ao reenviar email');
            } else {
                toast.success('Email de verificação reenviado!');
                setResendCooldown(60); // 60 segundos de cooldown
            }
        } catch (err) {
            toast.error('Erro ao reenviar email de verificação');
        } finally {
            setResendLoading(false);
        }
    };

    const handleCheckVerification = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.email_confirmed_at) {
                clearPolling();
                localStorage.removeItem('pendingVerificationEmail');
                toast.success('Email verificado com sucesso!');
                navigate('/dashboard');
            } else {
                toast.error('Email ainda não foi verificado. Verifique sua caixa de entrada.');
            }
        } catch (error) {
            toast.error('Erro ao verificar status da verificação');
        }
    };

    // Countdown timer para o botão de reenviar
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    return (
        <div className="auth-layout">
            <AuthPromoPanel 
                title="Quase lá!"
                subtitle="Verifique seu email para ativar sua conta e começar a usar o Recall."
            />

            <div className="auth-form-panel">
                <div className="form-container">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <ThemeToggle />
                    </div>
                    <div className="form-header">
                        <div className="success-icon">
                            <i className="fas fa-envelope-open-text"></i>
                        </div>
                        <h1>Verifique seu email</h1>
                        <p>Enviamos um link de verificação para:</p>
                        <p className="email-address">{email}</p>
                    </div>

                    <div className="info-box">
                        <h3>Próximos passos:</h3>
                        <ol>
                            <li>Verifique sua caixa de entrada (e a pasta de spam)</li>
                            <li>Clique no link de verificação no email</li>
                            <li style={{ color: '#28a745', fontWeight: '500' }}>Aguarde - verificaremos automaticamente!</li>
                        </ol>

                        {isChecking && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                backgroundColor: '#e3f2fd',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.9rem',
                                color: '#1976d2'
                            }}>
                                <i className="fas fa-spinner fa-spin"></i>
                                Verificando status do email...
                            </div>
                        )}

                        <div style={{
                            marginTop: '1rem',
                            padding: '0.75rem',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '0.5rem',
                            fontSize: '0.85rem',
                            color: '#6c757d'
                        }}>
                            <i className="fas fa-info-circle" style={{ marginRight: '0.5rem' }}></i>
                            Detectaremos automaticamente quando você verificar seu email. Não é necessário atualizar a página!
                        </div>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="btn btn-primary btn-full" 
                            onClick={handleCheckVerification}
                        >
                            Já verifiquei meu email
                        </button>
                        
                        <button 
                            type="button" 
                            className="btn btn-secondary btn-full" 
                            onClick={handleResendEmail}
                            disabled={resendLoading || resendCooldown > 0}
                        >
                            {resendLoading ? 'Reenviando...' : 
                             resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : 
                             'Reenviar email'}
                        </button>
                    </div>

                    <div className="help-text">
                        <p>Não recebeu o email? Verifique sua pasta de spam ou lixo eletrônico.</p>
                        <p>O email pode levar alguns minutos para chegar.</p>
                    </div>

                    <div className="toggle-panel">
                        <p>
                            Problemas com a verificação?
                            <Link to="/contato"> Entre em contato</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmailVerification;
