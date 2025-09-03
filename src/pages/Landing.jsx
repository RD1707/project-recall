import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import VideoModal from '../components/common/VideoModal'; 
import CookieBanner from '../components/common/CookieBanner'; 

import '../assets/css/landing.css'; 

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
  
  return (
    <div>
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
                    <li><a href="#demo" onClick={() => setMenuOpen(false)}>Demonstração</a></li>
                    <li><a href="#how-it-works" onClick={() => setMenuOpen(false)}>Como Funciona</a></li>
                    <li><Link to="/ajuda" onClick={() => setMenuOpen(false)}>Ajuda</Link></li>
                </ul>
            </nav>
            <div className="header-actions">
                <Link to="/login" className="btn btn-primary">Começar Agora</Link>
            </div>
            <button 
              id="mobile-nav-toggle" 
              className={`mobile-nav-toggle ${isMenuOpen ? 'is-active' : ''}`} 
              aria-label="Menu" 
              aria-expanded={isMenuOpen}
              onClick={() => setMenuOpen(!isMenuOpen)}
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
                    <h1>Memorize qualquer coisa, <span className="text-gradient">para sempre</span>.</h1>
                    <p className="hero-subtitle">Transforme suas anotações, PDFs e vídeos em flashcards inteligentes com o poder da Inteligência Artificial. Estude menos, aprenda mais.</p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn btn-primary btn-lg">Crie seus flashcards grátis</Link>
                    </div>
                </div>
                <div className="hero-image">
                    <div className="floating-cards">
                        <div className="card-item card-1">
                            <div className="card-content"><h4>O que é mitocôndria?</h4><p>Organela responsável pela produção de energia na célula.</p></div>
                            <div className="card-badge">Biologia</div>
                        </div>
                        <div className="card-item card-2">
                            <div className="card-content"><h4>Teorema de Pitágoras</h4><p>a² + b² = c²</p></div>
                            <div className="card-badge">Matemática</div>
                        </div>
                        <div className="card-item card-3">
                            <div className="card-content"><h4>Quem foi Machado de Assis?</h4><p>Fundador da Academia Brasileira de Letras.</p></div>
                            <div className="card-badge">Literatura</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="demo" className="demo">
            <div className="landing-container">
                <div className="demo-content">
                    <div className="demo-text">
                        <h2>Veja como é fácil começar</h2>
                        <p>Nosso processo intuitivo torna a criação de flashcards rápida e eficiente. Assista ao vídeo para ver a plataforma em ação.</p>
                        <ul className="demo-list">
                            <li><i className="fas fa-check-circle"></i> Upload de múltiplos formatos</li>
                            <li><i className="fas fa-check-circle"></i> Geração instantânea com IA</li>
                            <li><i className="fas fa-check-circle"></i> Revisão inteligente agendada</li>
                        </ul>
                    </div>
                    <div className="demo-video">
                        <div className="video-placeholder" onClick={() => setVideoModalOpen(true)}>
                            <div className="play-button"><i className="fas fa-play"></i></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="how-it-works" className="how-it-works">
            <div className="landing-container">
                <div className="section-header">
                    <h2 className="section-title">Comece a aprender em 3 passos simples</h2>
                    <p className="section-subtitle">Um processo simplificado para transformar seu material de estudo em conhecimento duradouro.</p>
                </div>
                <div className="steps-container">
                    <div className="step">
                        <div className="step-icon"><i className="fas fa-upload"></i></div>
                        <h3>Adicione seu Conteúdo</h3>
                        <p>Insira textos, PDFs ou links de vídeos do YouTube que você precisa estudar na plataforma.</p>
                    </div>
                    <div className="step">
                        <div className="step-icon"><i className="fas fa-bolt"></i></div>
                        <h3>Gere com um Clique</h3>
                        <p>Deixe nossa IA analisar o material e criar um baralho de flashcards completo para você.</p>
                    </div>
                    <div className="step">
                        <div className="step-icon"><i className="fas fa-graduation-cap"></i></div>
                        <h3>Estude e Memorize</h3>
                        <p>Use nosso sistema de repetição espaçada para revisar de forma inteligente e nunca mais esquecer.</p>
                    </div>
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
            <div className="footer-content">
                <div className="footer-brand">
                    <div className="logo"><Link to="/"><span className="logo-icon"><i className="fas fa-brain"></i></span>Recall</Link></div>
                    <p>Estude de forma mais inteligente com flashcards impulsionados por IA.</p>
                </div>
                <div className="footer-links">
                    <div className="footer-column"><h4>Produto</h4><ul><li><a href="#how-it-works">Recursos</a></li><li><a href="#demo">Demonstração</a></li></ul></div>
                    <div className="footer-column"><h4>Suporte</h4><ul><li><Link to="/ajuda">Centro de Ajuda</Link></li></ul></div>
                    <div className="footer-column"><h4>Legal</h4><ul><li><a href="#">Termos de Uso</a></li><li><a href="#">Política de Privacidade</a></li></ul></div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2025 Recall. Todos os direitos reservados.</p>
            </div>
        </div>
      </footer>

      <VideoModal isOpen={isVideoModalOpen} onClose={() => setVideoModalOpen(false)} />
      <CookieBanner />
    </div>
  );
}

export default Landing;