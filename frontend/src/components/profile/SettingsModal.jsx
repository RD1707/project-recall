import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import './SettingsModal.css'; 

function SettingsModal({ isOpen, onClose }) {
  // 1. O estado agora lê o tema inicial do localStorage
  const [settings, setSettings] = useState({
    theme: localStorage.getItem('app-theme') || 'light',
    notifications: true,
    sessionGoal: 20,
  });

  // 2. Este useEffect aplica a mudança de tema instantaneamente
  useEffect(() => {
    document.body.setAttribute('data-theme', settings.theme);
    localStorage.setItem('app-theme', settings.theme);
  }, [settings.theme]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 3. Função específica para trocar o tema
  const handleThemeChange = (theme) => {
    setSettings(s => ({ ...s, theme }));
  };

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
      <div className="settings-container">
        <div className="settings-section">
          <h4>Aparência</h4>
          <div className="setting-item">
            <label htmlFor="theme-select">Tema</label>
            <div className="theme-selector">
              <button
                className={`theme-option ${settings.theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeChange('light')} // 4. Chama a função de troca
              >
                <i className="fas fa-sun"></i> Claro
              </button>
              <button
                className={`theme-option ${settings.theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeChange('dark')} // 4. Chama a função de troca
              >
                <i className="fas fa-moon"></i> Escuro
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h4>Sessão de Estudo</h4>
          <div className="setting-item">
            <label htmlFor="sessionGoal">Meta de cards por sessão</label>
            <input 
              type="number" 
              id="sessionGoal"
              name="sessionGoal"
              value={settings.sessionGoal}
              onChange={handleChange}
              min="5"
              max="100"
            />
          </div>
        </div>

        <div className="settings-section">
            <h4>Notificações</h4>
             <div className="setting-item">
                <label htmlFor="notifications">Ativar notificações por e-mail</label>
                <label className="switch">
                    <input 
                      type="checkbox" 
                      id="notifications"
                      name="notifications"
                      checked={settings.notifications}
                      onChange={handleChange}
                    />
                    <span className="slider round"></span>
                </label>
            </div>
        </div>
      </div>
    </Modal>
  );
}

export default SettingsModal;