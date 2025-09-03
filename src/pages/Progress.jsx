import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Header from '../components/common/Header';
import { fetchAnalyticsSummary, fetchReviewsOverTime, fetchPerformanceInsights } from '../api/analytics';

import '../assets/css/progress.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Progress() {
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    const loadStaticData = async () => {
      setLoading(true);
      try {
        const [summaryData, insightsData] = await Promise.all([
          fetchAnalyticsSummary(),
          fetchPerformanceInsights(),
        ]);
        setSummary(summaryData);
        setInsights(insightsData);
      } catch (error) {
        console.error("Erro ao carregar dados de progresso", error);
      } finally {
        setLoading(false); 
      }
    };
    loadStaticData();
  }, []);

  useEffect(() => {
    const loadChart = async () => {
      try {
        const reviewsData = await fetchReviewsOverTime(timeRange);
        
        const labels = reviewsData.map(d => new Date(d.day).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }));
        const counts = reviewsData.map(d => d.count);

        setChartData({
          labels,
          datasets: [{
            label: 'Flashcards Revisados',
            data: counts,
            backgroundColor: 'rgba(79, 70, 229, 0.5)',
            borderColor: 'rgba(79, 70, 229, 1)',
            borderWidth: 2,
            borderRadius: 4,
          }]
        });
      } catch (error) {
        console.error(`Erro ao carregar dados do gráfico para ${timeRange} dias`, error);
        setChartData(null); 
      }
    };
    loadChart();
  }, [timeRange]);

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
  };

  const renderSkeletons = () => (
    <>
      <section className="stats-overview-grid">
        {[...Array(4)].map((_, i) => <div key={i} className="stat-card skeleton" style={{ height: '100px' }}></div>)}
      </section>
      <section className="card chart-card skeleton" style={{ height: '400px' }}></section>
      <section className="insights-grid">
          <div className="card skeleton" style={{ height: '200px' }}></div>
          <div className="card skeleton" style={{ height: '200px' }}></div>
      </section>
    </>
  );

  if (loading) {
    return (
      <>
        <Header />
        <main className="progress-main">{renderSkeletons()}</main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="progress-main">
        <div className="progress-header">
          <h1>Sua Jornada de Aprendizado</h1>
          <p>Analise seu desempenho e descubra onde focar para melhorar.</p>
        </div>
        
        <section className="stats-overview-grid">
          <div className="stat-card">
            <span className="stat-label">Total de Revisões</span>
            <span className="stat-value">{summary?.total_reviews ?? '--'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Precisão Média</span>
            <span className="stat-value">{Math.round(summary?.average_accuracy ?? 0)}%</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Melhor Sequência</span>
            <span className="stat-value">{summary?.max_streak ?? 0} dias</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Cards Dominados</span>
            <span className="stat-value">{summary?.mastered_cards ?? 0}</span>
          </div>
        </section>

        <section className="card chart-card">
          <div className="chart-header">
            <h2>Atividade de Revisão</h2>
            <div className="time-range-selector">
              <button className={`time-range-btn ${timeRange === 7 ? 'active' : ''}`} onClick={() => handleTimeRangeChange(7)}>7d</button>
              <button className={`time-range-btn ${timeRange === 30 ? 'active' : ''}`} onClick={() => handleTimeRangeChange(30)}>30d</button>
              <button className={`time-range-btn ${timeRange === 90 ? 'active' : ''}`} onClick={() => handleTimeRangeChange(90)}>90d</button>
            </div>
          </div>
          <div className="chart-container">
            {chartData ? <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} /> : <p>Não há dados para exibir.</p>}
          </div>
        </section>
        
        <section className="insights-grid">
            <div className="card" id="difficult-decks-card">
                <h2>Baralhos com Dificuldade</h2>
                <ul id="difficult-decks-list" className="difficult-decks-list">
                    {insights?.difficultDecks && insights.difficultDecks.length > 0 ? (
                        insights.difficultDecks.map(deck => (
                            <li key={deck.deck_id}>
                                <div className="deck-info">
                                    <span className="deck-name">{deck.deck_title}</span>
                                    <span className="error-rate">Taxa de erro: {Math.round(deck.error_rate)}%</span>
                                </div>
                                <Link to={`/study/${deck.deck_id}`} className="btn btn-secondary">Revisar</Link>
                            </li>
                        ))
                    ) : (
                        <li><p>Ótimo trabalho! Nenhum baralho com alta taxa de erro detectado.</p></li>
                    )}
                </ul>
            </div>
            <div className="card" id="insights-section">
                <h2>Seu Tutor IA</h2>
                <div id="insights-content">
                    <p>{insights?.insight || "Continue estudando para receber insights personalizados!"}</p>
                </div>
            </div>
        </section>
      </main>
    </>
  );
}

export default Progress;