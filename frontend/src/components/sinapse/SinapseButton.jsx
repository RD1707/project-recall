import React from 'react';
import { useSinapse } from '../../context/SinapseContext';

function SinapseButton() {
    const { toggleChat, isOpen } = useSinapse();

    return (
        <button
            className="sinapse-header-button"
            onClick={toggleChat}
            aria-label="Abrir Sinapse - Assistente IA"
            title="Falar com Sinapse"
        >
            <i className="fas fa-brain"></i>
            <span className="sinapse-button-text">Sinapse</span>
            {!isOpen && <span className="sinapse-pulse"></span>}
        </button>
    );
}

export default SinapseButton;
