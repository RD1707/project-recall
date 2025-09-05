import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import VideoModal from '../components/common/VideoModal';

import '../assets/css/landing.css'; // O CSS existente será amplamente reutilizado

// --- Subcomponentes para melhor organização e reutilização ---

// Card de feature individual (sem alterações)
const FeatureCard = ({ icon, title, children }) => (
    <div className="feature-card">
        <div className="feature-icon"><i className={`fas ${icon}`}></i></div>
        <h3>{title}</h3>
        <p>{children}</p>
    </div>
);

// NOVO: Card de depoimento
const TestimonialCard = ({ avatar, name, role, children }) => (
    <div className="testimonial-card">
        <div className="testimonial-rating">
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
        </div>
        <p className="testimonial-text">"{children}"</p>
        <div className="testimonial-author">
            <img src={avatar} alt={name} className="author-avatar" />
            <div className="author-info">
                <h4>{name}</h4>
                <p>{role}</p>
            </div>
        </div>
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
                {/* Seção Hero */}
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
                            {/* Cards animados com CSS para mais destaque */}
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
                
                {/* Seção de Features */}
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

                {/* NOVA SEÇÃO: Como funciona */}
                <section id="how-it-works" className="how-it-works">
                    <div className="landing-container">
                         <div className="section-header">
                            <h2 className="section-title">Comece a aprender em 3 passos</h2>
                        </div>
                        <div className="steps-container">
                            <StepCard icon="fa-upload" step="1" title="Envie seu Conteúdo">
                                Adicione textos, documentos (PDF, DOCX) ou links de vídeos do YouTube que você deseja estudar.
                            </StepCard>
                            <StepCard icon="fa-cogs" step="2" title="Gere com a IA">
                                Deixe nossa IA analisar o material e criar flashcards com perguntas e respostas pertinentes em segundos.
                            </StepCard>
                            <StepCard icon="fa-graduation-cap" step="3" title="Estude e Domine">
                                Revise seus cards com nosso sistema inteligente e observe seu conhecimento decolar.
                            </StepCard>
                        </div>
                    </div>
                </section>

                {/* NOVA SEÇÃO: Depoimentos */}
                <section id="testimonials" className="testimonials">
                    <div className="landing-container">
                        <div className="section-header">
                            <h2 className="section-title">Amado por estudantes e autodidatas</h2>
                        </div>
                        <div className="testimonials-grid">
                            <TestimonialCard avatar="https://i.pravatar.cc/150?u=a042581f4e29026704d" name="Juliana S." role="Estudante de Medicina">
                                O Recall mudou completamente minha forma de estudar para as provas. A criação de cards a partir dos meus PDFs economiza horas!
                            </TestimonialCard>
                            <TestimonialCard avatar="https://i.pravatar.cc/150?u=a042581f4e29026704e" name="Carlos M." role="Concurseiro">
                                A repetição espaçada é genial. Sinto que realmente estou memorizando o conteúdo, e não apenas decorando para o dia da prova.
                            </TestimonialCard>
                            <TestimonialCard avatar="https://i.pravatar.cc/150?u=a042581f4e29026704f" name="Beatriz L." role="Desenvolvedora de Software">
                                Uso o Recall para aprender novas tecnologias. Consigo transformar documentações densas em pílulas de conhecimento fáceis de revisar.
                            </TestimonialCard>
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