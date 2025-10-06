import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../api/supabaseClient';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ThemeToggle from '../components/common/ThemeToggle';

import '../assets/css/login.css';
import '../assets/css/ThemeToggle.css';

function EmailConfirmation() {
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('Verificando seu email...');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const processEmailConfirmation = async () => {
            try {
                // Espera um pouco para garantir que o Supabase processou a verificação
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Verifica o status do usuário
                const { data: { user }, error } = await supabase.auth.getUser();

                if (error) {
                    console.error('Erro ao verificar usuário:', error);
                    setStatus('error');
                    setMessage('Erro ao verificar email. Tente novamente.');
                    return;
                }

                if (user && user.email_confirmed_at) {
                    // Email foi verificado com sucesso
                    setStatus('success');
                    setMessage('Email verificado com sucesso! Redirecionando...');

                    // Remove email do localStorage se existir
                    localStorage.removeItem('pendingVerificationEmail');

                    // Toast de sucesso
                    toast.success('Email verificado com sucesso!');

                    // Redireciona após 2 segundos
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 2000);
                } else {
                    // Email ainda não foi verificado
                    setStatus('error');
                    setMessage('Email ainda não foi verificado. Redirecionando para a página de verificação...');

                    // Redireciona para página de verificação após 3 segundos
                    setTimeout(() => {
                        navigate('/email-verification');
                    }, 3000);
                }
            } catch (err) {
                console.error('Erro inesperado:', err);
                setStatus('error');
                setMessage('Erro inesperado. Redirecionando...');

                setTimeout(() => {
                    navigate('/email-verification');
                }, 3000);
            }
        };

        processEmailConfirmation();
    }, [navigate]);

    const getStatusIcon = () => {
        switch (status) {
            case 'verifying':
                return <LoadingSpinner size="large" />;
            case 'success':
                return <i className="fas fa-check-circle" style={{ fontSize: '4rem', color: '#28a745' }}></i>;
            case 'error':
                return <i className="fas fa-exclamation-triangle" style={{ fontSize: '4rem', color: '#dc3545' }}></i>;
            default:
                return <LoadingSpinner size="large" />;
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-promo-panel">
                <div className="promo-content">
                    <div className="promo-logo">
                        <i className="fas fa-brain"></i> Recall
                    </div>
                    <h2 className="promo-title">Verificando Email</h2>
                    <p className="promo-subtitle">Aguarde enquanto processamos sua verificação.</p>
                </div>
            </div>

            <div className="auth-form-panel">
                <div className="form-container">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <ThemeToggle />
                    </div>
                    <div className="form-header" style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            {getStatusIcon()}
                        </div>
                        <h1>
                            {status === 'verifying' && 'Verificando Email'}
                            {status === 'success' && 'Email Verificado!'}
                            {status === 'error' && 'Ops!'}
                        </h1>
                        <p>{message}</p>
                    </div>

                    {status === 'success' && (
                        <div className="info-box" style={{ textAlign: 'center' }}>
                            <h3>Bem-vindo ao Recall! 🎉</h3>
                            <p>Seu email foi verificado com sucesso. Você será redirecionado para o dashboard em instantes.</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-primary btn-full"
                                onClick={() => navigate('/email-verification')}
                            >
                                Ir para Verificação de Email
                            </button>

                            <button
                                type="button"
                                className="btn btn-secondary btn-full"
                                onClick={() => navigate('/login')}
                            >
                                Voltar ao Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EmailConfirmation;