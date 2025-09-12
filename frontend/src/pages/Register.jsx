import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../api/supabaseClient';
import { registerUser } from '../api/auth';

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

const GoogleIcon = () => (
    <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

function Register() {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [id]: type === 'checkbox' ? checked : value }));
        if (errors[id]) {
            setErrors(prev => ({ ...prev, [id]: null }));
        }
    };
    
    const validateForm = () => {
        const newErrors = {};
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
            newErrors.username = 'Usuário deve ter 3-20 caracteres (letras, números ou _).';
        }
        if (formData.password.length < 6) {
            newErrors.password = 'A senha deve ter no mínimo 6 caracteres.';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem.';
        }
        if (!formData.acceptTerms) {
            toast.error('Você deve aceitar os Termos de Uso para continuar.');
            return false;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setLoading(true);
        setErrors({});

        try {
            await registerUser({
                email: formData.email,
                password: formData.password,
                full_name: formData.fullName,
                username: formData.username,
            });

            toast.success('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
            navigate('/login');

        } catch (err) {
            if (err.field) {
                setErrors({ [err.field]: err.error });
            } else {
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) {
            toast.error(error.message || "Não foi possível conectar com o Google.");
        }
    };
    
    const togglePasswordVisibility = (ref) => {
        if (ref.current) {
            ref.current.type = ref.current.type === 'password' ? 'text' : 'password';
        }
    };

    return (
        <div className="auth-layout">
            <AuthPromoPanel 
                title="Junte-se a nós."
                subtitle="Crie sua conta e comece a transformar sua forma de estudar hoje mesmo."
            />

            <div className="auth-form-panel">
                <div className="form-container">
                    <div className="form-header">
                        <h1>Crie sua conta</h1>
                        <p>É rápido e fácil. Comece a usar o Recall agora!</p>
                    </div>
                
                    <div className="social-logins">
                        <button onClick={handleGoogleLogin} className="btn btn-social">
                            <GoogleIcon />
                            Continuar com Google
                        </button>
                    </div>
                    <div className="separator"><span>OU</span></div>

                    <form onSubmit={handleRegister} noValidate>
                        <div className="form-group">
                            <label htmlFor="fullName">Nome Completo</label>
                            <input type="text" id="fullName" className={`form-control ${errors.fullName ? 'error' : ''}`} required onChange={handleChange} value={formData.fullName} />
                            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="username">Nome de Usuário</label>
                            <input type="text" id="username" className={`form-control ${errors.username ? 'error' : ''}`} required onChange={handleChange} value={formData.username} />
                            {errors.username && <span className="field-error">{errors.username}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">E-mail</label>
                            <input type="email" id="email" className={`form-control ${errors.email ? 'error' : ''}`} required onChange={handleChange} value={formData.email} />
                            {errors.email && <span className="field-error">{errors.email}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Senha</label>
                            <div className="input-group">
                                <input ref={passwordRef} type="password" id="password" className={`form-control ${errors.password ? 'error' : ''}`} required onChange={handleChange} value={formData.password} />
                                <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility(passwordRef)} aria-label="Mostrar/ocultar senha"><i className="fas fa-eye"></i></button>
                            </div>
                            {errors.password && <span className="field-error">{errors.password}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar Senha</label>
                            <div className="input-group">
                                <input ref={confirmPasswordRef} type="password" id="confirmPassword" className={`form-control ${errors.confirmPassword ? 'error' : ''}`} required onChange={handleChange} value={formData.confirmPassword} />
                                <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility(confirmPasswordRef)} aria-label="Mostrar/ocultar senha"><i className="fas fa-eye"></i></button>
                            </div>
                            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label className="checkbox-label">
                                <input type="checkbox" id="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} />
                                <span>Eu li e aceito os <a href="/termos" target="_blank" rel="noopener noreferrer">Termos de Uso</a></span>
                            </label>
                        </div>
                        
                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Criando conta...' : 'Criar Conta'}
                        </button>
                    </form>
                    
                    <div className="toggle-panel">
                        <p>
                            Já tem uma conta?
                            <Link to="/login"> Entre agora</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;