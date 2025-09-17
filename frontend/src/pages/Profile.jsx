import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import { fetchProfile, updateProfile, uploadAvatar } from '../api/profile';
import { fetchAchievements } from '../api/achievements';
import { fetchAnalyticsSummary } from '../api/analytics';
import { fetchLeaderboard } from '../api/profile';
import toast from 'react-hot-toast';
import '../assets/css/profile.css';

// Estilos inline para a página de perfil
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
    bannerEditBtn: {
        position: 'absolute',
        bottom: '1rem',
        right: '1rem',
        background: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        padding: '0.75rem',
        borderRadius: '50%',
        cursor: 'pointer',
        border: 'none'
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
    avatarEditBtn: {
        position: 'absolute',
        bottom: '0',
        right: '0',
        background: 'var(--color-primary-500)',
        color: 'white',
        padding: '0.5rem',
        borderRadius: '50%',
        cursor: 'pointer',
        border: '3px solid var(--color-surface)'
    },
    profileActions: {
        marginTop: '1rem',
        display: 'flex',
        gap: '0.75rem'
    },
    btnEditProfile: {
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        border: '1px solid var(--color-border)',
        background: 'transparent',
        color: 'var(--color-text-default)',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    btnSave: {
        padding: '0.5rem 1.5rem',
        borderRadius: '20px',
        background: 'var(--color-primary-500)',
        color: 'white',
        border: 'none',
        fontWeight: '600',
        cursor: 'pointer'
    },
    btnCancel: {
        padding: '0.5rem 1.5rem',
        borderRadius: '20px',
        background: 'transparent',
        color: 'var(--color-text-default)',
        border: '1px solid var(--color-border)',
        fontWeight: '600',
        cursor: 'pointer'
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
    editInput: {
        width: '100%',
        maxWidth: '600px',
        padding: '0.75rem',
        marginBottom: '1rem',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        background: 'var(--color-background)',
        color: 'var(--color-text-default)',
        fontSize: '1rem'
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
    profileTabs: {
        background: 'var(--color-surface)',
        borderRadius: '12px',
        display: 'flex',
        padding: '0 2rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    },
    tabBtn: {
        padding: '1rem 1.5rem',
        background: 'transparent',
        border: 'none',
        borderBottom: '3px solid transparent',
        color: 'var(--color-text-muted)',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    tabBtnActive: {
        color: 'var(--color-primary-500)',
        borderBottomColor: 'var(--color-primary-500)'
    },
    profileContent: {
        marginTop: '1.5rem'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
    },
    statCard: {
        background: 'var(--color-surface)',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem'
    },
    statIcon: {
        width: '60px',
        height: '60px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.5rem'
    },
    achievementsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1.5rem'
    },
    achievementCard: {
        background: 'var(--color-surface)',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        textAlign: 'center',
        position: 'relative'
    },
    achievementCardUnlocked: {
        borderColor: 'var(--color-success)',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
    },
    achievementCardLocked: {
        opacity: '0.5',
        filter: 'grayscale(1)'
    },
    // Estilos adicionais para melhor aparência
    recentActivity: {
        background: 'var(--color-surface)',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    },
    statsSection: {
        background: 'var(--color-surface)',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    },
    detailedStats: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    detailedStat: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        background: 'var(--color-background)',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        border: '1px solid transparent'
    },
    detailedStatLabel: {
        color: 'var(--color-text-muted)',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    detailedStatValue: {
        color: 'var(--color-text-default)',
        fontWeight: '700',
        fontSize: '1.2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
    }
};

function Profile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    
    // User data
    const [userData, setUserData] = useState({
        id: '',
        email: '',
        username: '',
        fullName: '',
        bio: '',
        avatar_url: null,
        points: 0,
        current_streak: 0,
        banner_url: null
    });

    // Edit form data
    const [editData, setEditData] = useState({
        fullName: '',
        username: '',
        bio: ''
    });

    // Statistics data
    const [stats, setStats] = useState({
        totalCards: 0,
        totalDecks: 0,
        totalReviews: 0,
        studyTime: 0,
        bestStreak: 0,
        accuracy: 0
    });

    // Achievements data
    const [achievements, setAchievements] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            // Load user profile
            const profileData = await fetchProfile();
            if (profileData) {
                setUserData(profileData);
                setEditData({
                    fullName: profileData.fullName || '',
                    username: profileData.username || '',
                    bio: profileData.bio || ''
                });
            }

            // Load achievements
            try {
                const achievementsData = await fetchAchievements();
                // Garantir que as conquistas tenham o formato correto
                const formattedAchievements = achievementsData.map(ach => ({
                    ...ach,
                    unlocked: ach.unlocked || ach.completed || false,
                    name: ach.name || ach.title || '',
                    description: ach.description || '',
                    unlockedAt: ach.unlockedAt || ach.unlocked_at || ach.completed_at
                }));
                setAchievements(formattedAchievements || []);
                
                // Criar atividades recentes baseadas nas conquistas desbloqueadas
                const recentAchievements = formattedAchievements
                    .filter(ach => ach.unlocked && ach.unlockedAt)
                    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
                    .slice(0, 3)
                    .map(ach => ({
                        type: 'achievement',
                        icon: 'fas fa-trophy',
                        text: `Desbloqueou conquista: ${ach.name}`,
                        time: new Date(ach.unlockedAt)
                    }));
                
                setRecentActivity(recentAchievements);
            } catch (error) {
                console.error('Error loading achievements:', error);
            }

            // Load statistics
            try {
                const statsData = await fetchAnalyticsSummary();
                setStats({
                    totalCards: statsData.total_cards || 0,
                    totalDecks: statsData.total_decks || 0,
                    totalReviews: statsData.total_reviews || 0,
                    studyTime: statsData.total_study_time || 0,
                    bestStreak: statsData.best_streak || 0,
                    accuracy: statsData.average_accuracy || 0
                });
            } catch (error) {
                console.error('Error loading stats:', error);
            }

            // Load user rank
            try {
                const leaderboardData = await fetchLeaderboard('all_time');
                const currentUserRank = leaderboardData.findIndex(user => user.id === profileData.id) + 1;
                setUserRank(currentUserRank > 0 ? currentUserRank : null);
            } catch (error) {
                console.error('Error loading rank:', error);
            }

        } catch (error) {
            console.error('Error loading profile:', error);
            toast.error('Erro ao carregar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel editing
            setEditData({
                fullName: userData.fullName || '',
                username: userData.username || '',
                bio: userData.bio || ''
            });
        }
        setIsEditing(!isEditing);
    };

    const handleSaveProfile = async () => {
        try {
            const updatedData = await updateProfile(editData);
            setUserData(prev => ({ ...prev, ...updatedData }));
            setIsEditing(false);
            toast.success('Perfil atualizado com sucesso!');
        } catch (error) {
            toast.error('Erro ao atualizar perfil');
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const result = await uploadAvatar(file);
                setUserData(prev => ({ ...prev, avatar_url: result.avatar_url }));
                toast.success('Avatar atualizado com sucesso!');
            } catch (error) {
                toast.error('Erro ao atualizar avatar');
            }
        }
    };

    const handleBannerChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // For now, we'll just show a preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserData(prev => ({ ...prev, banner_url: reader.result }));
            };
            reader.readAsDataURL(file);
            toast.info('Funcionalidade de banner em desenvolvimento');
        }
    };

    const formatStudyTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}min`;
        }
        return `${mins}min`;
    };

    const getStreakEmoji = (streak) => {
        if (streak === 0) return '❄️';
        if (streak < 7) return '🔥';
        if (streak < 30) return '🔥🔥';
        if (streak < 100) return '🔥🔥🔥';
        return '🌟';
    };

    const formatTimeAgo = (date) => {
        if (!date) return '';
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) {
            return diffDays === 1 ? 'Ontem' : `Há ${diffDays} dias`;
        } else if (diffHours > 0) {
            return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        } else if (diffMins > 0) {
            return `Há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
        } else {
            return 'Agora mesmo';
        }
    };

    const getAchievementIcon = (achievement) => {
        const icons = {
            'first_deck': '📚',
            'first_card': '🃏',
            'streak_7': '🔥',
            'streak_30': '💪',
            'points_100': '⭐',
            'points_1000': '🏆',
            'reviews_100': '📖',
            'reviews_1000': '📚',
            'perfect_day': '✨',
            'early_bird': '🌅',
            'night_owl': '🦉',
            'Pioneiro': '🚩',
            'Estudante Dedicado': '🔥',
            'Leitor Voraz': '📖',
            'Mestre do Saber': '🎓',
            'Criador de Conteúdo': '✍️',
            'content_creator': '✍️',
            'deck_creator': '✍️'
        };
        return icons[achievement.name] || icons[achievement.type] || '🏅';
    };

    if (loading) {
        return (
            <>
                <Header />
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh'}}>
                    <div style={{textAlign: 'center'}}>
                        <div className="loading-spinner"></div>
                        <p style={{marginTop: '1rem', color: 'var(--color-text-muted)'}}>Carregando perfil...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div style={styles.profilePage}>
                <div style={styles.profileContainer}>
                    {/* Banner Section */}
                    <div style={{ ...styles.profileBanner, backgroundImage: userData.banner_url ? `url(${userData.banner_url})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        {isEditing && (
                            <label style={styles.bannerEditBtn}>
                                <i className="fas fa-camera"></i>
                                <input type="file" accept="image/*" onChange={handleBannerChange} hidden />
                            </label>
                        )}
                    </div>

                    {/* Profile Header */}
                    <div style={styles.profileHeaderSection}>
                        <div style={styles.profileHeaderContent}>
                        <div className="profile-avatar-section">
                            <div style={styles.profileAvatarWrapper}>
                                {userData.avatar_url ? (
                                    <img src={userData.avatar_url} alt="Avatar" style={styles.profileAvatarImg} />
                                ) : (
                                    <div style={styles.profileAvatarPlaceholder}>
                                        {userData.fullName ? userData.fullName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                )}
                                {isEditing && (
                                    <label style={styles.avatarEditBtn}>
                                        <i className="fas fa-camera"></i>
                                        <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div style={styles.profileActions}>
                            {isEditing ? (
                                <>
                                    <button style={styles.btnCancel} onClick={handleEditToggle}>
                                        Cancelar
                                    </button>
                                    <button style={styles.btnSave} onClick={handleSaveProfile}>
                                        Salvar
                                    </button>
                                </>
                            ) : (
                                <button style={styles.btnEditProfile} onClick={handleEditToggle}>
                                    <i className="fas fa-edit"></i> Editar perfil
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={styles.profileInfoSection}>
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    style={{...styles.editInput, fontSize: '1.5rem', fontWeight: '700'}}
                                    value={editData.fullName}
                                    onChange={(e) => setEditData(prev => ({ ...prev, fullName: e.target.value }))}
                                    placeholder="Nome completo"
                                />
                                <input
                                    type="text"
                                    style={styles.editInput}
                                    value={editData.username}
                                    onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                                    placeholder="Nome de usuário"
                                />
                                <textarea
                                    style={{...styles.editInput, resize: 'vertical', minHeight: '80px', lineHeight: '1.5'}}
                                    value={editData.bio}
                                    onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                                    placeholder="Biografia"
                                    rows="3"
                                />
                            </>
                        ) : (
                            <>
                                <h1 style={styles.profileName}>{userData.fullName || 'Usuário'}</h1>
                                <p style={styles.profileUsername}>@{userData.username || 'usuario'}</p>
                                {userData.bio && <p style={styles.profileBio}>{userData.bio}</p>}
                            </>
                        )}

                        <div style={styles.profileStatsRow}>
                            <div style={styles.profileStat}>
                                <i className="fas fa-star" style={{color: 'var(--color-primary-500)', fontSize: '1.2rem'}}></i>
                                <span style={{fontWeight: '700', color: 'var(--color-text-default)', fontSize: '1.1rem'}}>{userData.points}</span>
                                <span style={{color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>Pontos</span>
                            </div>
                            <div style={styles.profileStat}>
                                <i className="fas fa-fire" style={{color: 'var(--color-primary-500)', fontSize: '1.2rem'}}></i>
                                <span style={{fontWeight: '700', color: 'var(--color-text-default)', fontSize: '1.1rem'}}>{userData.current_streak} {getStreakEmoji(userData.current_streak)}</span>
                                <span style={{color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>Sequência</span>
                            </div>
                            {userRank && (
                                <div style={styles.profileStat}>
                                    <i className="fas fa-trophy" style={{color: 'var(--color-primary-500)', fontSize: '1.2rem'}}></i>
                                    <span style={{fontWeight: '700', color: 'var(--color-text-default)', fontSize: '1.1rem'}}>#{userRank}</span>
                                    <span style={{color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>Ranking</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div style={styles.profileTabs}>
                    <button 
                        style={{...styles.tabBtn, ...(activeTab === 'overview' ? styles.tabBtnActive : {})}}
                        onClick={() => setActiveTab('overview')}
                    >
                        <i className="fas fa-chart-pie"></i> Visão Geral
                    </button>
                    <button 
                        style={{...styles.tabBtn, ...(activeTab === 'achievements' ? styles.tabBtnActive : {})}}
                        onClick={() => setActiveTab('achievements')}
                    >
                        <i className="fas fa-medal"></i> Conquistas
                    </button>
                    <button 
                        style={{...styles.tabBtn, ...(activeTab === 'statistics' ? styles.tabBtnActive : {})}}
                        onClick={() => setActiveTab('statistics')}
                    >
                        <i className="fas fa-chart-bar"></i> Estatísticas
                    </button>
                </div>

                {/* Tab Content */}
                <div style={styles.profileContent}>
                    {activeTab === 'overview' && (
                        <div className="tab-content overview-content">
                            <div style={styles.statsGrid}>
                                <div style={styles.statCard}>
                                    <div style={styles.statIcon}>
                                        <i className="fas fa-layer-group"></i>
                                    </div>
                                    <div className="stat-info">
                                        <h3>{stats.totalDecks}</h3>
                                        <p>Baralhos Criados</p>
                                    </div>
                                </div>

                                <div style={styles.statCard}>
                                    <div style={styles.statIcon}>
                                        <i className="fas fa-clone"></i>
                                    </div>
                                    <div className="stat-info">
                                        <h3>{stats.totalCards}</h3>
                                        <p>Cartões Estudados</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <i className="fas fa-redo"></i>
                                    </div>
                                    <div className="stat-info">
                                        <h3>{stats.totalReviews}</h3>
                                        <p>Revisões Feitas</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <i className="fas fa-clock"></i>
                                    </div>
                                    <div className="stat-info">
                                        <h3>{formatStudyTime(stats.studyTime)}</h3>
                                        <p>Tempo de Estudo</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <i className="fas fa-fire-alt"></i>
                                    </div>
                                    <div className="stat-info">
                                        <h3>{stats.bestStreak} dias</h3>
                                        <p>Melhor Sequência</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <i className="fas fa-percentage"></i>
                                    </div>
                                    <div className="stat-info">
                                        <h3>{Math.round(stats.accuracy)}%</h3>
                                        <p>Taxa de Acerto</p>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.recentActivity}>
                                <h2 style={{margin: '0 0 1.5rem', fontSize: '1.3rem', color: 'var(--color-text-default)'}}>Atividade Recente</h2>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                    {recentActivity.length > 0 ? (
                                        recentActivity.map((activity, index) => (
                                            <div key={index} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                padding: '1rem',
                                                background: 'var(--color-background)',
                                                borderRadius: '8px',
                                                transition: 'all 0.3s ease'
                                            }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white'
                                                }}>
                                                    <i className={activity.icon}></i>
                                                </div>
                                                <div style={{flex: 1}}>
                                                    <p style={{margin: 0, color: 'var(--color-text-default)'}}>{activity.text}</p>
                                                    <span style={{fontSize: '0.85rem', color: 'var(--color-text-muted)'}}>
                                                        {formatTimeAgo(activity.time)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            {/* Atividades padrão quando não há dados reais */}
                                            {stats.totalReviews > 0 && (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    padding: '1rem',
                                                    background: 'var(--color-background)',
                                                    borderRadius: '8px'
                                                }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white'
                                                    }}>
                                                        <i className="fas fa-book"></i>
                                                    </div>
                                                    <div style={{flex: 1}}>
                                                        <p style={{margin: 0, color: 'var(--color-text-default)'}}>
                                                            {stats.totalReviews} revisões completadas
                                                        </p>
                                                        <span style={{fontSize: '0.85rem', color: 'var(--color-text-muted)'}}>
                                                            Total acumulado
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            {userData.current_streak > 0 && (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    padding: '1rem',
                                                    background: 'var(--color-background)',
                                                    borderRadius: '8px'
                                                }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white'
                                                    }}>
                                                        <i className="fas fa-fire"></i>
                                                    </div>
                                                    <div style={{flex: 1}}>
                                                        <p style={{margin: 0, color: 'var(--color-text-default)'}}>
                                                            Sequência atual de {userData.current_streak} dias!
                                                        </p>
                                                        <span style={{fontSize: '0.85rem', color: 'var(--color-text-muted)'}}>
                                                            Continue estudando!
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'achievements' && (
                        <div className="tab-content achievements-content">
                            <div className="achievements-header">
                                <h2>Suas Conquistas</h2>
                                <p className="achievements-count">
                                    {achievements.filter(a => a.unlocked).length} de {achievements.length} desbloqueadas
                                </p>
                            </div>
                            
                            <div style={styles.achievementsGrid}>
                                {achievements.length > 0 ? (
                                    achievements.map((achievement, index) => (
                                        <div 
                                            key={index} 
                                            style={{...styles.achievementCard, ...(achievement.unlocked ? styles.achievementCardUnlocked : styles.achievementCardLocked)}}
                                        >
                                            <div className="achievement-icon">
                                                {getAchievementIcon(achievement)}
                                            </div>
                                            <h3>{achievement.name}</h3>
                                            <p>{achievement.description}</p>
                                            {achievement.unlocked && (
                                                <span className="achievement-date">
                                                    Desbloqueado em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                                                </span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-achievements">
                                        <i className="fas fa-medal"></i>
                                        <p>Você ainda não tem conquistas. Continue estudando!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'statistics' && (
                        <div className="tab-content statistics-content">
                            <h2 style={{margin: '0 0 2rem', fontSize: '1.5rem', color: 'var(--color-text-default)'}}>Estatísticas Detalhadas</h2>
                            
                            <div style={styles.statsSection}>
                                <h3 style={{margin: '0 0 1.5rem', fontSize: '1.2rem', color: 'var(--color-text-default)', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)'}}>
                                    <i className="fas fa-chart-line" style={{marginRight: '0.5rem', color: 'var(--color-primary-500)'}}></i>
                                    Desempenho de Estudo
                                </h3>
                                <div style={styles.detailedStats}>
                                    <div style={styles.detailedStat}>
                                        <label style={styles.detailedStatLabel}>
                                            <i className="fas fa-layer-group" style={{color: 'var(--color-primary-500)'}}></i>
                                            Total de Baralhos:
                                        </label>
                                        <span style={styles.detailedStatValue}>{stats.totalDecks}</span>
                                    </div>
                                    <div style={styles.detailedStat}>
                                        <label style={styles.detailedStatLabel}>
                                            <i className="fas fa-clone" style={{color: 'var(--color-primary-500)'}}></i>
                                            Total de Cartões:
                                        </label>
                                        <span style={styles.detailedStatValue}>{stats.totalCards}</span>
                                    </div>
                                    <div style={styles.detailedStat}>
                                        <label style={styles.detailedStatLabel}>
                                            <i className="fas fa-redo" style={{color: 'var(--color-primary-500)'}}></i>
                                            Revisões Completadas:
                                        </label>
                                        <span style={styles.detailedStatValue}>{stats.totalReviews}</span>
                                    </div>
                                    <div style={styles.detailedStat}>
                                        <label style={styles.detailedStatLabel}>
                                            <i className="fas fa-clock" style={{color: 'var(--color-primary-500)'}}></i>
                                            Tempo Total de Estudo:
                                        </label>
                                        <span style={styles.detailedStatValue}>{formatStudyTime(stats.studyTime)}</span>
                                    </div>
                                    <div style={styles.detailedStat}>
                                        <label style={styles.detailedStatLabel}>
                                            <i className="fas fa-percentage" style={{color: 'var(--color-primary-500)'}}></i>
                                            Taxa de Acerto Média:
                                        </label>
                                        <span style={styles.detailedStatValue}>{Math.round(stats.accuracy)}%</span>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.statsSection}>
                                <h3 style={{margin: '0 0 1.5rem', fontSize: '1.2rem', color: 'var(--color-text-default)', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)'}}>
                                    <i className="fas fa-fire" style={{marginRight: '0.5rem', color: 'var(--color-primary-500)'}}></i>
                                    Sequências
                                </h3>
                                <div style={styles.detailedStats}>
                                    <div style={styles.detailedStat}>
                                        <label style={styles.detailedStatLabel}>
                                            <i className="fas fa-fire-alt" style={{color: 'var(--color-primary-500)'}}></i>
                                            Sequência Atual:
                                        </label>
                                        <span style={styles.detailedStatValue}>{userData.current_streak} dias {getStreakEmoji(userData.current_streak)}</span>
                                    </div>
                                    <div style={styles.detailedStat}>
                                        <label style={styles.detailedStatLabel}>
                                            <i className="fas fa-trophy" style={{color: 'var(--color-primary-500)'}}></i>
                                            Melhor Sequência:
                                        </label>
                                        <span style={styles.detailedStatValue}>{stats.bestStreak} dias</span>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.statsSection}>
                                <h3 style={{margin: '0 0 1.5rem', fontSize: '1.2rem', color: 'var(--color-text-default)', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)'}}>
                                    <i className="fas fa-star" style={{marginRight: '0.5rem', color: 'var(--color-primary-500)'}}></i>
                                    Pontuação e Ranking
                                </h3>
                                <div style={styles.detailedStats}>
                                    <div style={styles.detailedStat}>
                                        <label style={styles.detailedStatLabel}>
                                            <i className="fas fa-coins" style={{color: 'var(--color-primary-500)'}}></i>
                                            Pontos Totais:
                                        </label>
                                        <span style={styles.detailedStatValue}>{userData.points}</span>
                                    </div>
                                    {userRank && (
                                        <div style={styles.detailedStat}>
                                            <label style={styles.detailedStatLabel}>
                                                <i className="fas fa-medal" style={{color: 'var(--color-primary-500)'}}></i>
                                                Posição no Ranking:
                                            </label>
                                            <span style={styles.detailedStatValue}>#{userRank}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                </div>
            </div>
        </>
    );
}

export default Profile;
