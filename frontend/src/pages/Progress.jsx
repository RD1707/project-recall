import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Header from '../components/common/Header';
import { fetchAnalyticsSummary, fetchReviewsOverTime, fetchPerformanceInsights } from '../api/analytics';
// --- NOSSA NOVA IMPORTAÇÃO ---
import { fetchAchievements, recalculateAchievements } from '../api/achievements';
import { useAchievements } from '../context/AchievementsContext';
import toast from 'react-hot-toast';


import '../assets/css/progress.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatCard = ({ label, value, icon, loading, color }) => {
    if (loading) {
        return <div className="stat-card skeleton"></div>;
    }
    return (
        <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ '--icon-color': `var(--color-${color}-100)`, '--icon-bg': `var(--color-${color}-500)` }}>
                <i className={`fas ${icon}`}></i>
            </div>
            <div className="stat-info">
                <span className="stat-value">{value}</span>
                <span className="stat-label">{label}</span>
            </div>
        </div>
    );
};

const StatsGrid = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalyticsSummary()
            .then(setSummary)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const stats = [
        { label: "Total de Revisões", value: summary?.total_reviews ?? '--', icon: "fa-layer-group", color: "primary" },
        { label: "Precisão Média", value: `${Math.round(summary?.average_accuracy ?? 0)}%`, icon: "fa-bullseye", color: "success" },
        { label: "Melhor Sequência", value: `${summary?.max_streak ?? 0} dias`, icon: "fa-fire", color: "warning" },
        { label: "Cards Dominados", value: summary?.mastered_cards ?? 0, icon: "fa-award", color: "info" },
    ];

    return (
        <section className="stats-overview-grid">
            {stats.map(stat => <StatCard key={stat.label} {...stat} loading={loading} />)}
        </section>
    );
};

const ActivityChart = () => {
    const [chartData, setChartData] = useState(null);
    const [timeRange, setTimeRange] = useState(7);
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        setStatus('loading');
        // A API de analytics foi atualizada para usar RPC, então o fetch foi ajustado
        fetchReviewsOverTime(timeRange)
            .then(reviewsData => {
                if (!reviewsData || reviewsData.length === 0) {
                    setStatus('empty');
                    return;
                }
                
                const labels = reviewsData.map(d => new Date(d.day).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }));
                const counts = reviewsData.map(d => d.count);

                setChartData({
                    labels,
                    datasets: [{
                        label: 'Flashcards Revisados',
                        data: counts,
                        backgroundColor: 'rgba(79, 70, 229, 0.6)',
                        borderColor: 'rgba(79, 70, 229, 1)',
                        borderWidth: 2,
                        borderRadius: 6,
                        hoverBackgroundColor: 'rgba(79, 70, 229, 0.8)',
                    }]
                });
                setStatus('success');
            })
            .catch(() => setStatus('error'));
    }, [timeRange]);

    const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

    const renderContent = () => {
        if (status === 'loading') return <div className="chart-container skeleton"></div>;
        if (status === 'error') return <p>Não foi possível carregar os dados do gráfico.</p>;
        if (status === 'empty') return <p>Sem dados de revisão para este período.</p>;
        return <Bar data={chartData} options={chartOptions} />;
    };

    return (
        <div className="card-custom">
            <div className="card-header">
                <h2>Atividade de Revisão</h2>
                <div className="time-range-selector">
                    {[7, 30, 90].map(range => (
                        <button key={range} className={`time-range-btn ${timeRange === range ? 'active' : ''}`} onClick={() => setTimeRange(range)}>
                            {range}d
                        </button>
                    ))}
                </div>
            </div>
            <div className="chart-container-wrapper">
                {renderContent()}
            </div>
        </div>
    );
};

const InsightsSection = () => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPerformanceInsights()
            .then(setInsights)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="insights-grid">
            <div className="card-custom" id="difficult-decks-card">
                <div className="card-header">
                     <h2>Baralhos a Focar</h2>
                </div>
                {loading ? (
                    <div className="skeleton-list">{[...Array(3)].map((_, i) => <div key={i} className="skeleton-list-item"></div>)}</div>
                ) : (
                    <ul className="difficult-decks-list">
                        {insights?.difficultDecks && insights.difficultDecks.length > 0 ? (
                            insights.difficultDecks.map(deck => (
                                <li key={deck.deck_id}>
                                    <div className="deck-info">
                                        <span className="deck-name">{deck.deck_title}</span>
                                        <span className="error-rate">Taxa de erro: {Math.round(deck.error_rate)}%</span>
                                    </div>
                                    <Link to={`/study/${deck.deck_id}`} className="btn btn-secondary btn-sm">Revisar</Link>
                                </li>
                            ))
                        ) : (
                            <li><p>Ótimo trabalho! Nenhum baralho com alta taxa de erro detectado.</p></li>
                        )}
                    </ul>
                )}
            </div>
            <div className="card-custom" id="ai-tutor-card">
                <div className="card-header">
                    <h2>Seu Tutor IA</h2>
                </div>
                 {loading ? (
                    <div className="skeleton-text-block">
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line short"></div>
                    </div>
                ) : (
                    <p className="ai-insight-content">
                        {insights?.insight || "Continue estudando para receber insights personalizados do seu tutor IA!"}
                    </p>
                )}
            </div>
        </section>
    );
};

// --- COMPONENTE DE CONQUISTAS ATUALIZADO ---

const Achievements = () => {
    const { achievements, loading } = useAchievements();
    
    
    // Define a cor com base no ícone para manter a consistência visual
    const getColorFromIcon = (icon) => {
        if (icon.includes('fire')) return 'warning';
        if (icon.includes('book')) return 'info';
        if (icon.includes('brain')) return 'success';
        return 'primary';
    };

    return (
        <div className="card-custom">
            <div className="card-header">
                <h2>Conquistas</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Atualização automática
                </div>
            </div>
            {loading ? (
                <div className="skeleton-list">
                    {[...Array(4)].map((_, i) => <div key={i} className="skeleton-list-item" style={{height: '80px'}}></div>)}
                </div>
            ) : achievements && achievements.length > 0 ? (
                 <ul className="achievements-list">
                    {achievements.map((ach) => {
                        const isUnlocked = !!ach.unlocked_at;
                        const progress = Math.min(ach.progress, ach.goal); // Garante que a barra não passe de 100%
                        const progressPercent = ach.goal > 0 ? (progress / ach.goal) * 100 : 0;
                        const color = getColorFromIcon(ach.icon);

                        return (
                            <li key={ach.id} className={`achievement-item ${isUnlocked ? 'unlocked' : ''}`}>
                                <div className="achievement-content">
                                    <div className={`achievement-icon ${color}`}>
                                        <i className={`fas ${isUnlocked ? 'fa-check' : ach.icon}`}></i>
                                    </div>
                                    <div className="achievement-details">
                                        <div className="achievement-info">
                                            <h4>{ach.name}</h4>
                                            <span className="achievement-progress-text">{progress}/{ach.goal}</span>
                                        </div>
                                        <p>{ach.description}</p>
                                        <div className="progress-bar">
                                            <div className="progress-bar-fill" style={{ width: `${progressPercent}%`, backgroundColor: `var(--color-${color}-500)` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                    <i className="fas fa-trophy" style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                    <p>Nenhuma conquista encontrada.</p>
                    <p style={{ fontSize: '0.9rem' }}>Comece a estudar para desbloquear suas primeiras conquistas!</p>
                </div>
            )}
        </div>
    );
};


function Progress() {
    return (
        <>
            <Header />
            <main className="progress-main">
                <div className="progress-header">
                    <h1>Sua Jornada de Aprendizado</h1>
                    <p>Analise seu desempenho e descubra onde focar para melhorar a cada dia.</p>
                </div>
                
                <StatsGrid />

                <div className="progress-layout">
                    <div className="main-column">
                       <ActivityChart />
                       <InsightsSection />
                    </div>
                    <aside className="sidebar-column">
                        <Achievements />
                    </aside>
                </div>
            </main>
        </>
    );
}

export default Progress;