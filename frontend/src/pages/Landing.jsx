import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import VideoModal from '../components/common/VideoModal';

import '../assets/css/landing.css'; 

const FeatureCard = ({ icon, title, children }) => (
    <div className="feature-card">
        <div className="feature-icon"><i className={`fas ${icon}`}></i></div>
        <h3>{title}</h3>
        <p>{children}</p>
    </div>
);

function Landing() {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isVideoModalOpen, setVideoModalOpen] = useState(false);
    const headerRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 80) {
                headerRef.current?.classList.add('scrolled');
            } else {
                headerRef.current?.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setMenuOpen(!isMenuOpen);
    const closeMenu = () => setMenuOpen(false);

    return (
        <>
            <header className="landing-header" ref={headerRef}>
                <div className="header-container landing-container">
                    <div className="logo">
                        <Link to="/">
                            <span className="logo-icon"><i className="fas fa-brain"></i></span>
                            Recall
                        </Link>
                    </div>
                    <nav className={`main-nav ${isMenuOpen ? 'is-open' : ''}`} id="main-nav">
                        <ul>
                            <li><a href="#features" onClick={closeMenu}>Recursos</a></li>
                            <li><a href="#how-it-works" onClick={closeMenu}>Como Funciona</a></li>
                            <li><Link to="/ajuda" onClick={closeMenu}>Ajuda</Link></li>
                        </ul>
                    </nav>
                    <div className="header-actions">
                        <Link to="/login" className="btn btn-secondary btn-sm">Entrar</Link>
                        <Link to="/register" className="btn btn-primary">Começar Agora</Link>
                    </div>
                    <button
                        id="mobile-nav-toggle"
                        className={`mobile-nav-toggle ${isMenuOpen ? 'is-active' : ''}`}
                        aria-label="Menu"
                        aria-expanded={isMenuOpen}
                        onClick={toggleMenu}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </header>

            <main>
                <section className="hero">
                    <div className="hero-container landing-container">
                        <div className="hero-text">
                            <h1>Aprenda rápido, <br /> lembre <span className="text-gradient">para sempre</span>.</h1>
                            <p className="hero-subtitle">O Recall usa IA para transformar suas anotações, PDFs e vídeos em flashcards inteligentes. Otimize seus estudos e domine qualquer assunto.</p>
                            <div className="hero-actions">
                                <Link to="/register" className="btn btn-primary btn-lg">Criar conta grátis</Link>
                                <button onClick={() => setVideoModalOpen(true)} className="btn-video">
                                    <span className="play-icon"><i className="fas fa-play"></i></span>
                                    Veja como funciona
                                </button>
                            </div>
                        </div>
                        <div className="hero-image">
                            <div className="animated-cards-container">
                                <div className="animated-card card-1">
                                    <h4>O que é a fotossíntese?</h4>
                                    <p>Processo que converte luz em energia química.</p>
                                </div>
                                <div className="animated-card card-2">
                                    <h4>Capital do Japão?</h4>
                                    <p>Tóquio.</p>
                                </div>
                                <div className="animated-card card-3">
                                    <h4>Quem escreveu "Dom Quixote"?</h4>
                                    <p>Miguel de Cervantes.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section id="features" className="features">
                    <div className="landing-container">
                        <div className="section-header">
                            <h2 className="section-title">Uma plataforma de estudos completa</h2>
                            <p className="section-subtitle">Tudo o que você precisa para acelerar seu aprendizado em um só lugar.</p>
                        </div>
                        <div className="features-grid">
                             <FeatureCard icon="fa-magic" title="Criação com IA">
                                Nossa Inteligência Artificial transforma qualquer material de estudo em flashcards de alta qualidade, poupando seu tempo precioso.
                            </FeatureCard>
                            <FeatureCard icon="fa-calendar-check" title="Revisão Inteligente">
                                O algoritmo de repetição espaçada (SRS) agenda suas revisões no momento ideal para fixar o conhecimento na memória de longo prazo.
                            </FeatureCard>
                            <FeatureCard icon="fa-chart-pie" title="Análise de Progresso">
                                Acompanhe seu desempenho com gráficos e insights para entender seus pontos fortes e onde você precisa focar mais.
                            </FeatureCard>
                        </div>
                    </div>
                </section>
                
                <section className="final-cta">
                    <div className="landing-container">
                        <h2>Pronto para turbinar seus estudos?</h2>
                        <p>Junte-se a milhares de estudantes que estão aprendendo de forma mais rápida e eficiente.</p>
                        <Link to="/register" className="btn btn-primary btn-lg">Começar a usar gratuitamente</Link>
                        <p className="cta-subtext">Não é necessário cartão de crédito.</p>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <div className="landing-container">
                     <div className="footer-bottom">
                        <p>&copy; {new Date().getFullYear()} Recall. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>

            <VideoModal isOpen={isVideoModalOpen} onClose={() => setVideoModalOpen(false)} />
        </>
    );
}

export default Landing;