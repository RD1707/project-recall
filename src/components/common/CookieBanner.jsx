import React, { useState, useEffect } from 'react';

function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <div className="cookie-icon">🍪</div>
        <div className="cookie-text">
          <h3>Nós usamos cookies</h3>
          <p>Utilizamos cookies para melhorar sua experiência.</p>
        </div>
        <div className="cookie-actions">
          <button className="btn btn-secondary" onClick={handleReject}>Rejeitar</button>
          <button className="btn btn-primary" onClick={handleAccept}>Aceitar</button>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;