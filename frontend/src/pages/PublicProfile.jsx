import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/common/Header';
import CommunityDeckCard from '../components/decks/CommunityDeckCard';
import { fetchPublicProfile } from '../api/profile';
import toast from 'react-hot-toast';

import '../assets/css/profile.css';
import '../assets/css/dashboard.css'; 

function PublicProfile() {
    const { username } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const data = await fetchPublicProfile(username);
                setProfileData(data);
            } catch (error) {
                toast.error(error.message || "Não foi possível carregar este perfil.");
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [username]);

    if (loading) {
        return (
            <>
                <Header />
                <main className="profile-main">
                    <div className="loading-container" style={{ minHeight: '50vh' }}>
                        <div className="loading-spinner"></div>
                        <p>A carregar perfil...</p>
                    </div>
                </main>
            </>
        );
    }

    if (!profileData) {
        return (
            <>
                <Header />
                <main className="profile-main">
                    <div className="empty-state">
                        <h3>Perfil não encontrado</h3>
                        <p>O utilizador que procura não existe ou não tem um perfil público.</p>
                        <Link to="/community" className="btn btn-primary">Voltar à Comunidade</Link>
                    </div>
                </main>
            </>
        );
    }

    const { profile, decks } = profileData;

    return (
        <>
            <Header />
            <main className="profile-main">
                <header className="profile-header">
                    <div className="profile-avatar">
                        {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt={profile.username} />
                        ) : (
                            <span>{profile.username.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="profile-info">
                        <h1>{profile.fullName || profile.username}</h1>
                        <p className="username">@{profile.username}</p>
                        {profile.bio && <p className="bio">{profile.bio}</p>}
                    </div>
                </header>

                <section className="profile-decks-section">
                    <h2>Baralhos Públicos de {profile.username} ({decks.length})</h2>
                    {decks.length > 0 ? (
                        <div className="community-grid">
                            {decks.map(deck => (
                                <CommunityDeckCard key={deck.id} deck={deck} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: '2rem' }}>
                            <p>{profile.username} ainda não publicou nenhum baralho.</p>
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}

export default PublicProfile;