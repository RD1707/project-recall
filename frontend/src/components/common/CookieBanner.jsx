import React, { useState, useEffect } from 'react';

const PreferencesModal = ({ onClose, onSave }) => {
    const [preferences, setPreferences] = useState({
        analytics: false,
        marketing: false,
    });

    const handleToggle = (key) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        onSave(preferences);
        onClose();
    };

    return (
        <div className="cookie-modal-overlay" onClick={onClose}>
            <div className="cookie-modal" onClick={(e) => e.stopPropagation()}>
                <div className="cookie-modal-header">
                    <h3>Gerenciar Preferências de Cookies</h3>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <div className="cookie-modal-body">
                    <p>Para melhorar sua experiência, utilizamos cookies. Você pode escolher quais categorias de cookies deseja aceitar.</p>
                    
                    <div className="cookie-preference">
                        <div className="preference-text">
                            <strong>Necessários</strong>
                            <p>Esses cookies são essenciais para o funcionamento do site e não podem ser desativados.</p>
                        </div>
                        <label className="switch">
                            <input type="checkbox" checked disabled />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <div className="cookie-preference">
                        <div className="preference-text">
                            <strong>Análise (Analytics)</strong>
                            <p>Nos ajudam a entender como os visitantes interagem com o site, coletando informações anonimamente.</p>
                        </div>
                        <label className="switch">
                            <input type="checkbox" checked={preferences.analytics} onChange={() => handleToggle('analytics')} />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <div className="cookie-preference">
                        <div className="preference-text">
                            <strong>Marketing</strong>
                            <p>São usados para rastrear visitantes e exibir anúncios relevantes e atraentes.</p>
                        </div>
                        <label className="switch">
                            <input type="checkbox" checked={preferences.marketing} onChange={() => handleToggle('marketing')} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>
                <div className="cookie-modal-footer">
                    <button className="btn btn-primary" onClick={handleSave}>Salvar Preferências</button>
                </div>
            </div>
        </div>
    );
};

function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = {
        necessary: true,
        analytics: true,
        marketing: true,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('cookie_consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const consent = {
        necessary: true,
        analytics: false,
        marketing: false,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('cookie_consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  const handleSavePreferences = (preferences) => {
    const consent = {
        necessary: true,
        ...preferences,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('cookie_consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
        <div className="cookie-banner">
          <div className="cookie-content">
            <div className="cookie-icon">🍪</div>
            <div className="cookie-text">
              <h3>Nós usamos cookies</h3>
              <p>Utilizamos cookies para otimizar sua experiência em nosso site. Você pode personalizar suas preferências.</p>
            </div>
            <div className="cookie-actions">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(true)}>Personalizar</button>
              <button className="btn btn-secondary" onClick={handleRejectAll}>Rejeitar Todos</button>
              <button className="btn btn-primary" onClick={handleAcceptAll}>Aceitar Todos</button>
            </div>
          </div>
        </div>
        {isModalOpen && <PreferencesModal onClose={() => setIsModalOpen(false)} onSave={handleSavePreferences} />}
    </>
  );
}

export default CookieBanner;