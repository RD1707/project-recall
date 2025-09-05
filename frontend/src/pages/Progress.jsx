import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Header from '../components/common/Header';
import { fetchAnalyticsSummary, fetchReviewsOverTime, fetchPerformanceInsights } from '../api/analytics';

import '../assets/css/progress.css';

// Registrando componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Subcomponentes para uma UI modular e inteligente ---

// Card de Estatística Individual (com estado de loading)
const StatCard = ({ label, value, icon, loading }) => {
    if (loading) {
        return <div className="stat-card skeleton"></div>;
    }
    return (
        <div className="stat-card">
            <div className="stat-icon-wrapper"><i className={`fas ${icon}`}></i></div>
            <div className="stat-info">
                <span className="stat-value">{value}</span>
                <span className="stat-label">{label}</span>
            </div>
        </div>
    );
};

// Grid de Estatísticas que busca seus próprios dados
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
        { label: "Total de Revisões", value: summary?.total_reviews ?? '--', icon: "fa-layer-group" },
        { label: "Precisão Média", value: `${Math.round(summary?.average_accuracy ?? 0)}%`, icon: "fa-bullseye" },
        { label: "Melhor Sequência", value: `${summary?.max_streak ?? 0} dias`, icon: "fa-fire" },
        { label: "Cards Dominados", value: summary?.mastered_cards ?? 0, icon: "fa-award" },
    ];

    return (
        <section className="stats-overview-grid">
            {stats.map(stat => <StatCard key={stat.label} {...stat} loading={loading} />)}
        </section>
    );
};

// Gráfico de Atividade que gerencia seu próprio estado e dados
const ActivityChart = () => {
    const [chartData, setChartData] = useState(null);
    const [timeRange, setTimeRange] = useState(7);
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'

    useEffect(() => {
        setStatus('loading');
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
        <section className="card chart-card">
            <div className="chart-header">
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
        </section>
    );
};

// Seção de Insights com seus próprios dados
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
            <div className="card" id="difficult-decks-card">
                <h2>Baralhos a Focar</h2>
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
            <div className="card" id="insights-section">
                <h2>Seu Tutor IA</h2>
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


// --- Componente Principal da Página de Progresso ---

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
                <ActivityChart />
                <InsightsSection />

            </main>
        </>
    );
}

export default Progress;