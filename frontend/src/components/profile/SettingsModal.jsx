import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

function SettingsModal({ isOpen, onClose }) {
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurações"
      footer={
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Fechar
        </button>
      }
    >
      <div className="settings-section">
        <h3>Aparência</h3>
        <div className="setting-item">
          <label>Tema</label>
          <div className="toggle-group">
            <button
              className={`toggle-option ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
            >
              <i className="fas fa-sun"></i> Claro
            </button>
            <button
              className={`toggle-option ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              <i className="fas fa-moon"></i> Escuro
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default SettingsModal;