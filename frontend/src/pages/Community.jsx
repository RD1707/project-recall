import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../components/common/Header';
import CommunityDeckCard from '../components/decks/CommunityDeckCard';
import { fetchPublicDecks } from '../api/decks';
import toast from 'react-hot-toast';

import '../assets/css/community.css';
import '../assets/css/dashboard.css';

function Community() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    
    const [hasMore, setHasMore] = useState(true);
    const initialLoad = useRef(true);

    const abortControllerRef = useRef(null);

    const loadDecks = useCallback(async (currentPage, currentSearch, currentSort) => {
        // Cancelar request anterior se ainda estiver em andamento
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const params = { 
                page: currentPage, 
                search: currentSearch?.trim() || '', 
                sort: currentSort 
            };
            const newDecks = await fetchPublicDecks(params);
            
            // Verificar se o componente ainda está montado
            if (abortControllerRef.current?.signal.aborted) return;
            
            if (!Array.isArray(newDecks)) {
                throw new Error('Formato de dados inválido');
            }

            if (newDecks.length < 20) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            setDecks(prevDecks => {
                if (currentPage === 1) {
                    return newDecks;
                }
                
                // Evitar duplicatas baseado no ID
                const existingIds = new Set(prevDecks.map(deck => deck.id));
                const uniqueNewDecks = newDecks.filter(deck => !existingIds.has(deck.id));
                
                return [...prevDecks, ...uniqueNewDecks];
            });
        } catch (error) {
            // Não mostrar erro se foi cancelado
            if (error.name === 'AbortError') return;
            
            console.error('Erro ao carregar baralhos da comunidade:', error);
            
            // Mostrar erro específico baseado no tipo
            if (error.message.includes('Sessão expirada')) {
                toast.error("Sua sessão expirou. Faça login novamente.");
            } else if (error.message.includes('Muitas solicitações')) {
                toast.error("Muitas solicitações. Aguarde um momento e tente novamente.");
            } else {
                toast.error("Não foi possível carregar os baralhos da comunidade.");
            }
        } finally {
            if (currentPage === 1) setLoading(false);
            else setLoadingMore(false);
        }
    }, []);

    // Cleanup ao desmontar o componente
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);
    
    useEffect(() => {
        if (initialLoad.current) {
            initialLoad.current = false;
            loadDecks(1, searchTerm, sortBy);
            return;
        }

        const handler = setTimeout(() => {
            setPage(1); 
            loadDecks(1, searchTerm, sortBy);
        }, 500); 

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, sortBy, loadDecks]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadDecks(nextPage, searchTerm, sortBy);
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="decks-grid">
                    {[...Array(6)].map((_, i) => <div key={i} className="skeleton-deck"></div>)}
                </div>
            );
        }

        if (decks.length === 0) {
            return (
                <div className="empty-state">
                    <h3>Nenhum baralho encontrado</h3>
                    <p>Tente ajustar a sua busca ou filtros.</p>
                </div>
            );
        }

        return (
            <>
                <div className="community-grid">
                    {decks.map(deck => (
                        <CommunityDeckCard key={`${deck.id}-${deck.title}`} deck={deck} />
                    ))}
                </div>
                {hasMore && (
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <button onClick={handleLoadMore} className="btn btn-secondary" disabled={loadingMore}>
                            {loadingMore ? 'A carregar...' : 'Carregar Mais'}
                        </button>
                    </div>
                )}
            </>
        );
    };

    return (
        <>
            <Header />
            <main className="community-main">
                <div className="community-header">
                    <h2>Marketplace da Comunidade</h2>
                    <p>Explore, estude e clone baralhos criados por outros estudantes.</p>
                </div>

                <div className="header-actions" style={{ marginBottom: '2rem', justifyContent: 'center' }}>
                    <div className="search-box">
                        <i className="fas fa-search"></i>
                        <input 
                            type="text" 
                            placeholder="Buscar por título ou descrição..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="custom-select" 
                        style={{ width: '200px', height: '44px' }}
                    >
                        <option value="created_at">Mais Recentes</option>
                    </select>
                </div>

                {renderContent()}
            </main>
        </>
    );
}

export default Community;