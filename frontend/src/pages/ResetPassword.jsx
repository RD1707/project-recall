import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPassword } from '../api/auth';

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

function ResetPassword() {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    // Extrair tokens da URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');

    useEffect(() => {
        // Verificar se temos os tokens necessários
        if (!accessToken || !refreshToken || type !== 'recovery') {
            toast.error('Link de recuperação inválido ou expirado.');
            navigate('/forgot-password');
        }
    }, [accessToken, refreshToken, type, navigate]);

    const validatePassword = (password) => {
        if (password.length < 6) {
            return 'A senha deve ter pelo menos 6 caracteres.';
        }
        if (!/(?=.*[a-z])/.test(password)) {
            return 'A senha deve conter pelo menos uma letra minúscula.';
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            return 'A senha deve conter pelo menos uma letra maiúscula.';
        }
        if (!/(?=.*\d)/.test(password)) {
            return 'A senha deve conter pelo menos um número.';
        }
        return null;
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        
        // Limpar erros quando o usuário começar a digitar
        if (errors[id]) {
            setErrors(prev => ({ ...prev, [id]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Validações
        const newErrors = {};

        if (!formData.password) {
            newErrors.password = 'A nova senha é obrigatória.';
        } else {
            const passwordError = validatePassword(formData.password);
            if (passwordError) {
                newErrors.password = passwordError;
            }
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirme sua nova senha.';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            await resetPassword({
                accessToken,
                refreshToken,
                newPassword: formData.password
            });

            toast.success('Senha redefinida com sucesso!');
            navigate('/login');
            
        } catch (error) {
            toast.error(error.message || 'Erro ao redefinir senha. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (ref) => {
        if (ref.current) {
            ref.current.type = ref.current.type === 'password' ? 'text' : 'password';
        }
    };

    const getPasswordStrength = (password) => {
        if (password.length === 0) return { strength: 0, text: '', color: '' };
        
        let score = 0;
        if (password.length >= 6) score++;
        if (/(?=.*[a-z])/.test(password)) score++;
        if (/(?=.*[A-Z])/.test(password)) score++;
        if (/(?=.*\d)/.test(password)) score++;
        if (/(?=.*[^a-zA-Z\d])/.test(password)) score++;

        if (score <= 2) return { strength: score, text: 'Fraca', color: '#ff4757' };
        if (score === 3) return { strength: score, text: 'Média', color: '#ffa502' };
        if (score === 4) return { strength: score, text: 'Forte', color: '#26d0ce' };
        return { strength: score, text: 'Muito Forte', color: '#2ed573' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <div className="auth-layout">
            <AuthPromoPanel 
                title="Crie uma nova senha"
                subtitle="Sua nova senha deve ser forte e única para manter sua conta segura."
            />

            <div className="auth-form-panel">
                <div className="form-container">
                    <div className="form-header">
                        <h1>Redefinir senha</h1>
                        <p>Digite sua nova senha abaixo. Certifique-se de que seja forte e fácil de lembrar.</p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="password">Nova senha</label>
                            <div className="input-group">
                                <input
                                    ref={passwordRef}
                                    type="password"
                                    id="password"
                                    className={`form-control ${errors.password ? 'error' : ''}`}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Digite sua nova senha"
                                    disabled={loading}
                                />
                                <button 
                                    type="button" 
                                    className="password-toggle" 
                                    onClick={() => togglePasswordVisibility(passwordRef)}
                                    aria-label="Mostrar/ocultar senha"
                                >
                                    <i className="fas fa-eye"></i>
                                </button>
                            </div>
                            {errors.password && <p className="error-message">{errors.password}</p>}
                            
                            {formData.password && (
                                <div className="password-strength">
                                    <div className="strength-bar">
                                        <div 
                                            className="strength-fill" 
                                            style={{ 
                                                width: `${(passwordStrength.strength / 5) * 100}%`,
                                                backgroundColor: passwordStrength.color
                                            }}
                                        ></div>
                                    </div>
                                    <span className="strength-text" style={{ color: passwordStrength.color }}>
                                        {passwordStrength.text}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar nova senha</label>
                            <div className="input-group">
                                <input
                                    ref={confirmPasswordRef}
                                    type="password"
                                    id="confirmPassword"
                                    className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirme sua nova senha"
                                    disabled={loading}
                                />
                                <button 
                                    type="button" 
                                    className="password-toggle" 
                                    onClick={() => togglePasswordVisibility(confirmPasswordRef)}
                                    aria-label="Mostrar/ocultar senha"
                                >
                                    <i className="fas fa-eye"></i>
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
                        </div>

                        <div className="password-requirements">
                            <h4>Sua senha deve conter:</h4>
                            <ul>
                                <li className={/(?=.*[a-z])/.test(formData.password) ? 'valid' : ''}>
                                    <i className="fas fa-check"></i> Uma letra minúscula
                                </li>
                                <li className={/(?=.*[A-Z])/.test(formData.password) ? 'valid' : ''}>
                                    <i className="fas fa-check"></i> Uma letra maiúscula
                                </li>
                                <li className={/(?=.*\d)/.test(formData.password) ? 'valid' : ''}>
                                    <i className="fas fa-check"></i> Um número
                                </li>
                                <li className={formData.password.length >= 6 ? 'valid' : ''}>
                                    <i className="fas fa-check"></i> Pelo menos 6 caracteres
                                </li>
                            </ul>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="btn btn-primary btn-full" 
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Redefinindo...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-lock"></i> Redefinir Senha
                                </>
                            )}
                        </button>
                    </form>

                    <div className="toggle-panel">
                        <p>
                            Lembrou da senha?
                            <Link to="/login"> Fazer login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;