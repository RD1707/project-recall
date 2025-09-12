import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import { fetchLeaderboard } from '../api/profile';
import toast from 'react-hot-toast';
import '../assets/css/ranking.css';

const RankingRow = ({ user, rank }) => (
    <div className="ranking-row">
        <div className="rank-cell">
            <span className={`rank-badge rank-${rank}`}>{rank}</span>
        </div>
        <div className="user-cell">
            <div className="user-avatar">
                {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username || 'Avatar do usuário'} />
                ) : (
                    <span>{(user.username || '?').charAt(0).toUpperCase()}</span>
                )}
            </div>
            <span className="username">{user.username || 'Usuário Anônimo'}</span>
        </div>
        <div className="points-cell">
            <span className="points-value">{(user.points || 0).toLocaleString('pt-BR')}</span>
            <span className="points-label">pontos</span>
        </div>
    </div>
);


function Ranking() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activePeriod, setActivePeriod] = useState('all_time'); 

    useEffect(() => {
        const loadLeaderboard = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchLeaderboard(activePeriod);
                setLeaderboard(data || []);
            } catch (error) {
                console.error('Erro ao carregar ranking:', error);
                setError(error.message || "Não foi possível carregar o ranking.");
                toast.error("Não foi possível carregar o ranking.");
            } finally {
                setLoading(false);
            }
        };

        loadLeaderboard();
    }, [activePeriod]); 

    const renderBody = () => {
        if (loading) {
            return <div className="loading-state">Carregando ranking...</div>;
        }
        if (error) {
            return <div className="error-state">Erro: {error}</div>;
        }
        if (leaderboard.length === 0) {
            return <div className="empty-state">Ainda não há dados para este ranking. Comece a estudar!</div>;
        }
        return leaderboard.map((user, index) => (
            <RankingRow key={user.username} user={user} rank={index + 1} />
        ));
    };

    return (
        <>
            <Header />
            <main className="ranking-main">
                <div className="ranking-header">
                    <h1><i className="fas fa-trophy"></i> Ranking de Estudantes</h1>
                    <p>Veja sua posição e compare seu progresso com os melhores estudantes do Recall.</p>
                </div>

                <div className="ranking-container">
                    <div className="ranking-filters">
                        <button 
                            className={`filter-btn ${activePeriod === 'weekly' ? 'active' : ''}`}
                            onClick={() => setActivePeriod('weekly')}
                        >
                            <i className="fas fa-calendar-week"></i> Semanal
                        </button>
                        <button 
                            className={`filter-btn ${activePeriod === 'all_time' ? 'active' : ''}`}
                            onClick={() => setActivePeriod('all_time')}
                        >
                            <i className="fas fa-globe"></i> Geral
                        </button>
                    </div>

                    <div className="ranking-table">
                        <div className="ranking-table-header">
                            <span>Posição</span>
                            <span>Usuário</span>
                            <span>{activePeriod === 'weekly' ? 'Pontos na Semana' : 'Pontuação Total'}</span>
                        </div>
                        <div className="ranking-table-body">
                            {renderBody()}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default Ranking;