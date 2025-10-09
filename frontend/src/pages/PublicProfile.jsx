import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/common/Header';
import CommunityDeckCard from '../components/decks/CommunityDeckCard';
import { fetchPublicProfile } from '../api/profile';
import toast from 'react-hot-toast';

import '../assets/css/profile.css';
import '../assets/css/dashboard.css';

// Estilos inline para o perfil público (baseado no Profile.jsx)
const styles = {
    profilePage: {
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)'
    },
    profileContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem'
    },
    profileBanner: {
        height: '200px',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        borderRadius: '12px',
        marginTop: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    profileHeaderSection: {
        background: 'var(--color-surface)',
        borderRadius: '12px',
        padding: '0 2rem 2rem',
        marginTop: '-4rem',
        position: 'relative',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    },
    profileHeaderContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
    },
    profileAvatarWrapper: {
        width: '134px',
        height: '134px',
        borderRadius: '50%',
        border: '4px solid var(--color-surface)',
        background: 'var(--color-surface)',
        position: 'relative',
        marginTop: '-3rem'
    },
    profileAvatarImg: {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        objectFit: 'cover'
    },
    profileAvatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3rem',
        fontWeight: 'bold',
        color: 'white'
    },
    profileInfoSection: {
        marginTop: '1rem'
    },
    profileName: {
        fontSize: '1.5rem',
        fontWeight: '700',
        margin: '0',
        color: 'var(--color-text-default)'
    },
    profileUsername: {
        color: 'var(--color-text-muted)',
        margin: '0.25rem 0 1rem',
        fontSize: '1rem'
    },
    profileBio: {
        color: 'var(--color-text-default)',
        margin: '1rem 0',
        lineHeight: '1.5',
        maxWidth: '600px'
    },
    profileInterests: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '1rem',
        marginBottom: '1rem'
    },
    interestTag: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s ease',
        cursor: 'default'
    },
    profileStatsRow: {
        display: 'flex',
        gap: '2rem',
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--color-border)'
    },
    profileStat: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    decksSectionTitle: {
        fontSize: '1.3rem',
        fontWeight: '700',
        marginBottom: '1.5rem',
        color: 'var(--color-text-default)',
        background: 'var(--color-surface)',
        padding: '1.5rem 2rem',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    }
}; 

function PublicProfile() {
    const { username } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            if (!username || username.trim() === '') {
                setError('Nome de usuário inválido');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const data = await fetchPublicProfile(username);
                clearTimeout(timeoutId);

                if (!data || !data.profile) {
                    throw new Error('Dados do perfil não encontrados');
                }

                setProfileData(data);
            } catch (error) {
                if (error.name === 'AbortError') {
                    setError('Tempo limite excedido ao carregar o perfil');
                } else if (error.message.includes('não encontrado') || error.message.includes('USER_NOT_FOUND')) {
                    setError('Perfil não encontrado');
                } else {
                    setError(error.message || "Não foi possível carregar este perfil.");
                }
                console.error('Erro ao carregar perfil público:', error);
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
                <div style={styles.profilePage}>
                    <div style={styles.profileContainer}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '80vh',
                            width: '100%'
                        }}>
                            <div style={{
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div className="loading-spinner" style={{margin: '0 auto'}}></div>
                                <p style={{marginTop: '1rem', color: 'var(--color-text-muted)'}}>Carregando perfil...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div style={styles.profilePage}>
                    <div style={styles.profileContainer}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '80vh',
                            flexDirection: 'column',
                            textAlign: 'center'
                        }}>
                            <h3 style={{color: 'var(--color-text-default)', marginBottom: '1rem'}}>
                                {error === 'Perfil não encontrado' ? 'Perfil não encontrado' : 'Erro ao carregar perfil'}
                            </h3>
                            <p style={{color: 'var(--color-text-muted)', marginBottom: '2rem'}}>
                                {error === 'Perfil não encontrado'
                                    ? 'O usuário que você procura não existe ou não tem um perfil público.'
                                    : error
                                }
                            </p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Link to="/community" className="btn btn-primary">Voltar à Comunidade</Link>
                                <Link to="/ranking" className="btn btn-secondary">Ver Ranking</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!profileData || !profileData.profile) {
        return (
            <>
                <Header />
                <div style={styles.profilePage}>
                    <div style={styles.profileContainer}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '80vh',
                            flexDirection: 'column',
                            textAlign: 'center'
                        }}>
                            <h3 style={{color: 'var(--color-text-default)', marginBottom: '1rem'}}>Perfil não encontrado</h3>
                            <p style={{color: 'var(--color-text-muted)', marginBottom: '2rem'}}>O usuário que você procura não existe ou não tem um perfil público.</p>
                            <Link to="/community" className="btn btn-primary">Voltar à Comunidade</Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const { profile, decks } = profileData;

    return (
        <>
            <Header />
            <div style={styles.profilePage}>
                <div style={styles.profileContainer}>
                    {/* Banner Section */}
                    <div style={{
                        ...styles.profileBanner,
                        backgroundImage: profile.bannerUrl ? `url(${profile.bannerUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}>
                    </div>

                    {/* Profile Header */}
                    <div style={styles.profileHeaderSection}>
                        <div style={styles.profileHeaderContent}>
                            <div className="profile-avatar-section">
                                <div style={styles.profileAvatarWrapper}>
                                    {profile.avatarUrl ? (
                                        <img src={profile.avatarUrl} alt="Avatar" style={styles.profileAvatarImg} />
                                    ) : (
                                        <div style={styles.profileAvatarPlaceholder}>
                                            {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={styles.profileInfoSection}>
                            <h1 style={styles.profileName}>{profile.fullName || 'Usuário'}</h1>
                            <p style={styles.profileUsername}>@{profile.username || 'usuario'}</p>
                            {profile.bio && <p style={styles.profileBio}>{profile.bio}</p>}

                            {/* Seção de Áreas de Interesse */}
                            {profile.interests && profile.interests.length > 0 && (
                                <div style={styles.profileInterests}>
                                    {profile.interests.map((interest, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                ...styles.interestTag,
                                                backgroundColor: interest.color || '#6366f1'
                                            }}
                                        >
                                            {interest.name}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={styles.profileStatsRow}>
                                <div style={styles.profileStat}>
                                    <i className="fas fa-star" style={{color: 'var(--color-primary-500)', fontSize: '1.2rem'}}></i>
                                    <span style={{fontWeight: '700', color: 'var(--color-text-default)', fontSize: '1.1rem'}}>{profile.points}</span>
                                    <span style={{color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>Pontos</span>
                                </div>
                                <div style={styles.profileStat}>
                                    <i className="fas fa-fire" style={{color: 'var(--color-primary-500)', fontSize: '1.2rem'}}></i>
                                    <span style={{fontWeight: '700', color: 'var(--color-text-default)', fontSize: '1.1rem'}}>{profile.currentStreak}</span>
                                    <span style={{color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>Sequência</span>
                                </div>
                                <div style={styles.profileStat}>
                                    <i className="fas fa-layer-group" style={{color: 'var(--color-primary-500)', fontSize: '1.2rem'}}></i>
                                    <span style={{fontWeight: '700', color: 'var(--color-text-default)', fontSize: '1.1rem'}}>{profile.totalPublicDecks}</span>
                                    <span style={{color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>Baralhos Públicos</span>
                                </div>
                                <div style={styles.profileStat}>
                                    <i className="fas fa-clone" style={{color: 'var(--color-primary-500)', fontSize: '1.2rem'}}></i>
                                    <span style={{fontWeight: '700', color: 'var(--color-text-default)', fontSize: '1.1rem'}}>{profile.totalPublicCards}</span>
                                    <span style={{color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>Cartões Públicos</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Decks Section */}
                    <div style={styles.decksSectionTitle}>
                        <i className="fas fa-layer-group" style={{marginRight: '0.5rem'}}></i>
                        Baralhos Públicos de {profile.username || 'Usuário'} ({decks.length})
                    </div>

                    {decks.length > 0 ? (
                        <div className="community-grid">
                            {decks.map(deck => (
                                <CommunityDeckCard key={deck.id} deck={deck} />
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            background: 'var(--color-surface)',
                            padding: '3rem 2rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            color: 'var(--color-text-muted)',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                        }}>
                            <i className="fas fa-layer-group" style={{fontSize: '3rem', marginBottom: '1rem', opacity: 0.3}}></i>
                            <p style={{fontSize: '1.1rem', margin: 0}}>{profile.username || 'Este usuário'} ainda não publicou nenhum baralho.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default PublicProfile;