import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../api/supabaseClient';

import '../assets/css/login.css'; 

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
    setFormData((prev) => ({ 
      ...prev, 
      [id]: type === 'checkbox' ? checked : value 
    }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: null }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem.';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'A senha deve ter no mínimo 6 caracteres.';
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      newErrors.username = 'Usuário inválido (3-20 caracteres, letras, números ou _).';
    }
    if (!formData.acceptTerms) {
      toast.error('Você deve aceitar os Termos de Uso.');
      return false;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({}); 

    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            username: formData.username,
          }
        }
      });

      if (error) throw error;
      
      if (data.user) {
        toast.success('Conta criada! Verifique seu e-mail para confirmação.');
        navigate('/login');
      }

    } catch (error) {
      if (error.message.includes("User already registered")) {
        setErrors({ email: "Este e-mail já está em uso." });
      } else if (error.message.includes("duplicate key value violates unique constraint \"profiles_username_key\"")) {
        setErrors({ username: "Este nome de usuário já está em uso." });
      } else {
        toast.error(error.message || 'Erro ao criar conta.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) throw error;
    } catch (error) {
        toast.error(error.error_description || error.message);
    }
  };

  const togglePasswordVisibility = (ref) => {
    if (ref.current) {
        const type = ref.current.type;
        ref.current.type = type === 'password' ? 'text' : 'password';
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-promo-panel">
        <div className="promo-content">
          <Link to="/" className="promo-logo">Recall</Link>
          <h2 className="promo-title">Junte-se a nós.</h2>
          <p className="promo-subtitle">Crie sua conta e comece a transformar sua forma de estudar hoje mesmo.</p>
        </div>
      </div>
      <div className="auth-form-panel">
        <div className="form-container">
          <div className="form-header">
            <h1>Crie sua conta</h1>
            <p>É rápido e fácil. Comece a usar o Recall agora!</p>
          </div>
          
          <div className="social-logins">
            <button onClick={handleGoogleLogin} className="btn btn-social">
                Entrar com Google
            </button>
          </div>
          <div className="separator"><span>OU</span></div>

          <form onSubmit={handleRegister}>
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
                <input ref={passwordRef} type="password" id="password" className={`form-control ${errors.password ? 'error' : ''}`} required minLength="6" onChange={handleChange} value={formData.password} />
                <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility(passwordRef)}><i className="fas fa-eye"></i></button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Senha</label>
              <div className="input-group">
                <input ref={confirmPasswordRef} type="password" id="confirmPassword" className={`form-control ${errors.confirmPassword ? 'error' : ''}`} required minLength="6" onChange={handleChange} value={formData.confirmPassword} />
                <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility(confirmPasswordRef)}><i className="fas fa-eye"></i></button>
              </div>
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>
            
            <div className="form-group">
                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} />
                    <span>Li e aceito os <a href="/termos" target="_blank">Termos de Uso</a></span>
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