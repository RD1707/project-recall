import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../api/supabaseClient';
import { completeUserProfile } from '../api/auth'; 

import '../assets/css/login.css';

function CompleteProfile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', username: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      setFormData({
        fullName: session.user.user_metadata?.full_name || '',
        username: ''
      });
    };
    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      setError('Nome de usuário inválido (3-20 caracteres, apenas letras, números ou _).');
      return;
    }

    setLoading(true);
    try {
      await completeUserProfile({
        fullName: formData.fullName,
        username: formData.username
      });
      toast.success('Perfil completo! Bem-vindo ao Recall.');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Carregando...</div>; 
  }

  return (
    <div className="auth-layout">
      <div className="auth-promo-panel">
        <div className="promo-content">
          <Link to="/" className="promo-logo">Recall</Link>
          <h2 className="promo-title">Quase lá!</h2>
          <p className="promo-subtitle">Só precisamos de mais alguns detalhes para personalizar sua experiência de estudo.</p>
        </div>
      </div>
      <div className="auth-form-panel">
        <div className="form-container">
          <div className="form-header">
            <h1>Complete seu Perfil</h1>
            <p>Conectado como: <strong>{user.email}</strong></p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Nome Completo</label>
              <input type="text" id="fullName" className="form-control" required value={formData.fullName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="username">Nome de Usuário</label>
              <input type="text" id="username" className={`form-control ${error ? 'error' : ''}`} required value={formData.username} onChange={handleChange} />
              <small style={{ marginTop: '4px', display: 'block' }}>Será seu nome público no Recall.</small>
              {error && <span className="field-error">{error}</span>}
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