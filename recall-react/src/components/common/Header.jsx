import React from 'react';
import { Link, NavLink } from 'react-router-dom';

function Header() {
  const user = {
    points: 0,
    streak: 0,
    initial: 'U',
    email: 'carregando...',
  };

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
              <span id="user-points">{user.points}</span> Pontos
            </div>
            <div className="user-stat">
              <span className="stat-icon"><i className="fas fa-fire"></i></span>
              <span id="user-streak">{user.streak}</span> Dias
            </div>
          </div>
          <div className="user-menu">
            <button id="user-menu-button" className="user-avatar" aria-label="Menu do usuário">
              <span id="user-avatar-text">{user.initial}</span>
            </button>
            {/* A lógica do dropdown será adicionada depois */}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;