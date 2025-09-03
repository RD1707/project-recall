import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { fetchProfile, logout } from '../../api/profile';
import toast from 'react-hot-toast';

function Header() {
  const [user, setUser] = useState({
    points: 0,
    streak: 0,
    initial: 'R',
    email: 'carregando...',
    fullName: 'Usuário'
  });
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const profileData = await fetchProfile();
      if (profileData) {
        setUser({
          points: profileData.points || 0,
          streak: profileData.current_streak || 0,
          initial: profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : (profileData.email ? profileData.email.charAt(0).toUpperCase() : 'R'),
          email: profileData.email,
          fullName: profileData.full_name || 'Usuário'
        });
      } else {
        toast.error("Sessão inválida. Redirecionando para o login.");
        navigate('/login');
      }
      setLoading(false);
    };
    loadProfile();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Você saiu da sua conta.');
    navigate('/login');
  };

  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-logo-section">
          <Link to="/dashboard">
            <i className="fas fa-brain"></i> Recall
          </Link>
        </div>
        <nav className="app-nav">
          <NavLink to="/progress" className="nav-link">
            <i className="fas fa-chart-line"></i> Meu Progresso
          </NavLink>
          <div className="user-stats">
            <div className="user-stat">
              <span className="stat-icon"><i className="fas fa-star"></i></span>
              <span id="user-points">{loading ? '...' : user.points}</span> Pontos
            </div>
            <div className="user-stat">
              <span className="stat-icon"><i className="fas fa-fire"></i></span>
              <span id="user-streak">{loading ? '...' : user.streak}</span> Dias
            </div>
          </div>
          <div className="user-menu" ref={dropdownRef}>
            <button id="user-menu-button" className="user-avatar" aria-label="Menu do usuário" onClick={toggleDropdown}>
              <span id="user-avatar-text">{user.initial}</span>
            </button>
            <div id="user-dropdown" className={`dropdown-menu ${isDropdownOpen ? 'visible' : ''}`}>
              <div className="dropdown-user-info">
                  <div className="user-avatar"><span id="dropdown-avatar-text">{user.initial}</span></div>
                  <div className="user-details">
                      <span id="user-full-name">{user.fullName}</span>
                      <span className="user-plan">{user.email}</span>
                  </div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={() => { /* Lógica para abrir modal de perfil */ }}>
                <i className="fas fa-user"></i> Meu Perfil
              </button>
              <button className="dropdown-item" onClick={() => { /* Lógica para abrir modal de configurações */ }}>
                <i className="fas fa-cog"></i> Configurações
              </button>
              <div className="dropdown-divider"></div>
              <button id="logout-link" className="dropdown-item logout-btn" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Sair
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;