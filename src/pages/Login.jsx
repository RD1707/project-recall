import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../api/supabaseClient'; 

import '../assets/css/login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error; 
      }
      
      toast.success('Login bem-sucedido!');
      navigate('/dashboard'); 

    } catch (error) {
      toast.error(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-promo-panel">
        <div className="promo-content">
          <Link to="/" className="promo-logo">Recall</Link>
          <h2 className="promo-title">Transforme anotações em conhecimento.</h2>
          <p className="promo-subtitle">Junte-se a milhares de estudantes que estão aprendendo de forma mais rápida e eficiente com flashcards inteligentes.</p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="form-container">
          <div id="auth-panel">
            <div className="form-header">
              <h1 id="form-title">Acesse sua conta</h1>
              <p id="form-subtitle">Bem-vindo de volta! Por favor, insira seus dados.</p>
            </div>

            <form id="auth-form" onSubmit={handleLogin}>
              <div className="login-fields">
                <div className="form-group">
                  <label htmlFor="email">E-mail</label>
                  <div className="input-group">
                    <input
                      className="form-control"
                      type="email"
                      id="email"
                      placeholder="seu@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="password">Senha</label>
                  <div className="input-group">
                    <input
                      className="form-control"
                      type="password"
                      id="password"
                      placeholder="Sua senha"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)} 
                    />
                  </div>
                </div>
              </div>

              <button type="submit" id="auth-button" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'A entrar...' : 'Entrar'}
              </button>
            </form>

            <div className="toggle-panel">
              <p>
                <span>Não tem uma conta?</span>
                <Link to="/register"> Registre-se agora</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;