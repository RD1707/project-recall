import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSinapse } from '../context/SinapseContext';
import SinapseChat from '../components/sinapse/SinapseChat';

function Sinapse() {
    const navigate = useNavigate();
    const { loadConversations } = useSinapse();

    useEffect(() => {
        // Carregar conversas quando a página carrega
        loadConversations();
    }, [loadConversations]);

    return (
        <div className="sinapse-page">
            <SinapseChat onBack={() => navigate(-1)} />
        </div>
    );
}

export default Sinapse;
