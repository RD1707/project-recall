import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import VideoModal from '../components/common/VideoModal';

import '../assets/css/landing.css';

// --- Subcomponentes para melhor organização e reutilização ---

// Card de feature individual
const FeatureCard = ({ icon, title, children }) => (
    <div className="feature-card">
        <div className="feature-icon"><i className={`fas ${icon}`}></i></div>
        <h3>{title}</h3>
        <p>{children}</p>
    </div>
);

// Card de passo a passo
const StepCard = ({ icon, step, title, children }) => (
    <div className="step">
        <div className="step-number">{step}</div>
        <div className="step-icon"><i className={`fas ${icon}`}></i></div>
        <h3>{title}</h3>
        <p>{children}</p>
    </div>
);

// Card de depoimento
const TestimonialCard = ({ stars, text, author, role, avatar }) => (
    <div className="testimonial-card">
        <div className="testimonial-rating">
            {[...Array(stars)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
        </div>
        <p className="testimonial-text">"{text}"</p>
        <div className="testimonial-author">
            <img src={avatar} alt={author} className="author-avatar" />
            <div className="author-info">
                <h4>{author}</h4>
                <p>{role}</p>
            </div>
        </div>
    </div>
);


// --- Componente Principal da Landing Page ---

function Landing() {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isVideoModalOpen, setVideoModalOpen] = useState(false);
    const headerRef = useRef(null);

    // Efeito para adicionar sombra no header ao rolar a página
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
                            <li><a href="#testimonials" onClick={closeMenu}>Depoimentos</a></li>
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
                {/* Seção Hero */}
                <section className="hero">
                    <div className="hero-container landing-container">
                        <div className="hero-text">
                            <h1>Memorize qualquer coisa, <span className="text-gradient">para sempre</span>.</h1>
                            <p className="hero-subtitle">Transforme anotações, PDFs e vídeos em flashcards inteligentes com o poder da IA. Estude menos, aprenda mais e retenha o conhecimento de verdade.</p>
                            <div className="hero-actions">
                                <Link to="/register" className="btn btn-primary btn-lg">Crie sua conta grátis</Link>
                                <button onClick={() => setVideoModalOpen(true)} className="btn-video">
                                    <span className="play-icon"><i className="fas fa-play"></i></span>
                                    Veja em 2 minutos
                                </button>
                            </div>
                        </div>
                        <div className="hero-image">
                            <div className="floating-cards">
                                <div className="card-item card-1">
                                    <div className="card-content"><h4>O que é mitocôndria?</h4><p>Organela responsável pela produção de energia na célula (ATP).</p></div>
                                    <div className="card-badge">Biologia</div>
                                </div>
                                <div className="card-item card-2">
                                    <div className="card-content"><h4>Teorema de Pitágoras</h4><p>Em um triângulo retângulo, a² + b² = c².</p></div>
                                    <div className="card-badge">Matemática</div>
                                </div>
                                <div className="card-item card-3">
                                    <div className="card-content"><h4>Quem foi Machado de Assis?</h4><p>Considerado o maior nome da literatura brasileira e fundador da ABL.</p></div>
                                    <div className="card-badge">Literatura</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Seção de Features */}
                <section id="features" className="features">
                    <div className="landing-container">
                        <div className="section-header">
                            <h2 className="section-title">A plataforma de estudos definitiva</h2>
                            <p className="section-subtitle">Tudo o que você precisa para otimizar seu aprendizado em um só lugar.</p>
                        </div>
                        <div className="features-grid">
                            <FeatureCard icon="fa-magic" title="Criação Mágica com IA">
                                Nossa IA transforma qualquer texto, PDF ou vídeo do YouTube em flashcards de alta qualidade em segundos, economizando seu tempo.
                            </FeatureCard>
                            <FeatureCard icon="fa-calendar-alt" title="Repetição Espaçada">
                                O algoritmo inteligente agenda suas revisões no momento exato, garantindo que o conhecimento seja transferido para a memória de longo prazo.
                            </FeatureCard>
                            <FeatureCard icon="fa-chart-line" title="Análise de Desempenho">
                                Acompanhe seu progresso com gráficos detalhados e insights gerados por IA para identificar seus pontos fortes e fracos.
                            </FeatureCard>
                        </div>
                    </div>
                </section>

                {/* Seção Final de CTA */}
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
                    <div className="footer-content">
                        <div className="footer-brand">
                            <div className="logo"><Link to="/"><span className="logo-icon"><i className="fas fa-brain"></i></span>Recall</Link></div>
                            <p>Estude de forma mais inteligente com flashcards impulsionados por Inteligência Artificial.</p>
                        </div>
                        <div className="footer-links">
                            <div className="footer-column"><h4>Suporte</h4><ul><li><Link to="/ajuda">Centro de Ajuda</Link></li></ul></div>
                            <div className="footer-column"><h4>Legal</h4><ul><li><a href="#">Termos de Uso</a></li><li><a href="#">Política de Privacidade</a></li></ul></div>
                        </div>
                    </div>
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