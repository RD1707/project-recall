import React from 'react';
import { useNavigate } from 'react-router-dom';

function SinapseButton() {
    const navigate = useNavigate();

    return (
        <button
            className="sinapse-header-button"
            onClick={() => navigate('/sinapse')}
            aria-label="Abrir Sinapse - Assistente IA"
            title="Falar com Sinapse"
        >
            <i className="fas fa-brain"></i>
            <span className="sinapse-button-text">Sinapse</span>
        </button>
    );
}

export default SinapseButton;
