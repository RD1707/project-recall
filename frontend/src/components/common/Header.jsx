import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { fetchProfile, logout } from '../../api/profile';
import toast from 'react-hot-toast';

import ProfileModal from '../profile/ProfileModal';
import SettingsModal from '../profile/SettingsModal'; 

function Header() {
  const [user, setUser] = useState({
    points: 0,
    streak: 0,
    initial: '',
    email: 'carregando...',
    fullName: 'Usuário',
    avatar_url: null, 
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false); 

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
            initial: profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : (profileData.email ? profileData.email.charAt(0).toUpperCase() : 'R'),
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
          <nav className="app-nav">
            <NavLink to="/progress" className="nav-link">
              <i className="fas fa-chart-line"></i> Meu Progresso
            </NavLink>
            <div className="user-stats">
              <div className="user-stat"><span className="stat-icon"><i className="fas fa-star"></i></span><span>{loading ? '...' : user.points}</span> Pontos</div>
              <div className="user-stat"><span className="stat-icon"><i className="fas fa-fire"></i></span><span>{loading ? '...' : user.streak}</span> Dias</div>
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
                        <span className="user-plan">{user.username}</span>
                    </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={() => { setProfileModalOpen(true); setDropdownOpen(false); }}><i className="fas fa-user-circle"></i> Meu Perfil</button>
                <button className="dropdown-item" onClick={() => { setSettingsModalOpen(true); setDropdownOpen(false); }}><i className="fas fa-cog"></i> Configurações</button>
                <div className="dropdown-divider"></div>
                <button id="logout-link" className="dropdown-item logout-btn" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Sair</button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setProfileModalOpen(false)} user={user} onProfileUpdate={handleProfileUpdate} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} />
    </>
  );
}

export default Header;