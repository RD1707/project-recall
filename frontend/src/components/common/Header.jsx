import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { fetchProfile, logout } from '../../api/profile';
import toast from 'react-hot-toast';

import ProfileModal from '../profile/ProfileModal';
import SettingsModal from '../profile/SettingsModal'; 

function Header() {
  const [user, setUser] = useState({
    points: 0,
    current_streak: 0,
    initial: '',
    email: 'carregando...',
    fullName: 'Usuário',
    username: 'Usuário',
    avatar_url: null,
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false); 

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const profileData = await fetchProfile();
        if (profileData) {
          setUser({
            ...profileData,
            initial: profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : (profileData.email ? profileData.email.charAt(0).toUpperCase() : 'R'),
          });
        } else {
          navigate('/login');
        }
      } catch (error) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
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
  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleProfileUpdate = (updatedUserData) => {
      setUser(prevUser => ({ ...prevUser, ...updatedUserData }));
  };

  const avatarContent = (avatarClass = 'user-avatar') => {
      if (user.avatar_url) {
          return <img src={user.avatar_url} alt="Avatar" className={avatarClass} />;
      }
      return <div className={avatarClass}><span id="user-avatar-text">{user.initial}</span></div>;
  };
  
  const dropdownAvatarContent = () => {
    if (user.avatar_url) {
        return <img src={user.avatar_url} alt="Avatar" className="user-avatar" />;
    }
    return <div className="user-avatar"><span id="dropdown-avatar-text">{user.initial}</span></div>;
  };

  return (
    <>
      <header className="app-header">
        <div className="header-container">
          <div className="header-logo-section">
            <Link to="/dashboard">
              <i className="fas fa-brain"></i> Recall
            </Link>
          </div>
          {/* Desktop Navigation */}
          <nav className="app-nav">
            <NavLink to="/progress" className="nav-link">
              <i className="fas fa-chart-line"></i> Meu Progresso
            </NavLink>
            <NavLink to="/ranking" className="nav-link">
              <i className="fas fa-trophy"></i> Ranking
            </NavLink>
            <NavLink to="/community" className="nav-link">
              <i className="fas fa-users"></i> Comunidade
            </NavLink>
            <div className="user-stats">
              <div className="user-stat"><span className="stat-icon"><i className="fas fa-star"></i></span><span>{loading ? '...' : user.points}</span> Pontos</div>
              <div className="user-stat"><span className="stat-icon"><i className="fas fa-fire"></i></span><span>{loading ? '...' : user.current_streak}</span> Dias</div>
            </div>
            <div className="user-menu" ref={dropdownRef}>
              <button id="user-menu-button" className="user-avatar-button" aria-label="Menu do usuário" onClick={toggleDropdown}>
                {avatarContent()}
              </button>
              <div id="user-dropdown" className={`dropdown-menu ${isDropdownOpen ? 'visible' : ''}`}>
                <div className="dropdown-user-info">
                    {dropdownAvatarContent()}
                    <div className="user-details">
                        <span id="user-full-name">{user.fullName}</span>
                        <span className="user-plan">@{user.username}</span>
                    </div>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/my-profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}><i className="fas fa-user-circle"></i> Meu Perfil</Link>
                <button className="dropdown-item" onClick={() => { setSettingsModalOpen(true); setDropdownOpen(false); }}><i className="fas fa-cog"></i> Configurações</button>
                <div className="dropdown-divider"></div>
                <button id="logout-link" className="dropdown-item logout-btn" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Sair</button>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Abrir menu mobile"
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      />

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <Link to="/dashboard" onClick={closeMobileMenu}>
            <i className="fas fa-brain"></i> Recall
          </Link>
          <button
            className="mobile-menu-close"
            onClick={closeMobileMenu}
            aria-label="Fechar menu mobile"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Mobile User Stats */}
        <div className="mobile-user-stats">
          <h4>Seus Dados</h4>
          <div className="mobile-stats-grid">
            <div className="mobile-stat">
              <div className="mobile-stat-icon">
                <i className="fas fa-star"></i>
              </div>
              <span className="mobile-stat-value">{loading ? '...' : user.points}</span>
              <div className="mobile-stat-label">Pontos</div>
            </div>
            <div className="mobile-stat">
              <div className="mobile-stat-icon">
                <i className="fas fa-fire"></i>
              </div>
              <span className="mobile-stat-value">{loading ? '...' : user.current_streak}</span>
              <div className="mobile-stat-label">Dias</div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="mobile-nav">
          <NavLink to="/progress" className="nav-link" onClick={closeMobileMenu}>
            <i className="fas fa-chart-line"></i>
            Meu Progresso
          </NavLink>
          <NavLink to="/ranking" className="nav-link" onClick={closeMobileMenu}>
            <i className="fas fa-trophy"></i>
            Ranking
          </NavLink>
          <NavLink to="/community" className="nav-link" onClick={closeMobileMenu}>
            <i className="fas fa-users"></i>
            Comunidade
          </NavLink>
          <div className="dropdown-divider"></div>
          <Link to="/my-profile" className="nav-link" onClick={closeMobileMenu}>
            <i className="fas fa-user-circle"></i>
            Meu Perfil
          </Link>
          <button
            className="nav-link"
            onClick={() => { setSettingsModalOpen(true); closeMobileMenu(); }}
            style={{background: 'none', border: 'none', width: '100%', justifyContent: 'flex-start'}}
          >
            <i className="fas fa-cog"></i>
            Configurações
          </button>
          <div className="dropdown-divider"></div>
          <button
            className="nav-link"
            onClick={handleLogout}
            style={{background: 'none', border: 'none', width: '100%', justifyContent: 'flex-start', color: 'var(--color-error)'}}
          >
            <i className="fas fa-sign-out-alt"></i>
            Sair
          </button>
        </nav>
      </div>

      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setProfileModalOpen(false)} user={user} onProfileUpdate={handleProfileUpdate} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} />
    </>
  );
}

export default Header;