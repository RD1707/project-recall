import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import VideoModal from '../components/common/VideoModal';

import '../assets/css/landing.css';

const FeatureCard = ({ icon, title, description, badge }) => (
    <div className="feature-card">
        {badge && <span className="feature-badge">{badge}</span>}
        <div className="feature-icon">
            <i className={`fas ${icon}`}></i>
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
    </div>
);

const TestimonialCard = ({ name, role, institution, image, rating, text }) => (
    <div className="testimonial-card">
        <div className="testimonial-rating">
            {[...Array(rating)].map((_, i) => (
                <i key={i} className="fas fa-star"></i>
            ))}
        </div>
        <p className="testimonial-text">"{text}"</p>
        <div className="testimonial-author">
            <img src={image} alt={name} className="author-avatar" />
            <div className="author-info">
                <h4>{name}</h4>
                <p>{role} • {institution}</p>
            </div>
        </div>
    </div>
);

const StatCard = ({ number, label, suffix = "" }) => (
    <div className="stat-card">
        <div className="stat-number">
            {number}<span className="stat-suffix">{suffix}</span>
        </div>
        <div className="stat-label">{label}</div>
    </div>
);

const StepCard = ({ number, icon, title, description }) => (
    <div className="step">
        <div className="step-number">{number}</div>
        <div className="step-icon">
            <i className={`fas ${icon}`}></i>
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
    </div>
);

const PricingCard = ({ name, price, period, features, highlighted, ctaText }) => (
    <div className={`pricing-card ${highlighted ? 'highlighted' : ''}`}>
        {highlighted && <span className="pricing-badge">Mais Popular</span>}
        <div className="pricing-header">
            <h3>{name}</h3>
            <div className="pricing-price">
                <span className="price-currency">R$</span>
                <span className="price-value">{price}</span>
                <span className="price-period">/{period}</span>
            </div>
        </div>
        <ul className="pricing-features">
            {features.map((feature, index) => (
                <li key={index}>
                    <i className="fas fa-check"></i>
                    {feature}
                </li>
            ))}
        </ul>
        <Link to="/register" className={`btn ${highlighted ? 'btn-primary' : 'btn-secondary'} btn-block`}>
            {ctaText}
        </Link>
    </div>
);

function Landing() {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isVideoModalOpen, setVideoModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('students');
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
                            <span className="logo-text">Recall</span>
                        </Link>
                    </div>
                    <nav className={`main-nav ${isMenuOpen ? 'is-open' : ''}`}>
                        <ul>
                            <li><a href="#features" onClick={closeMenu}>Recursos</a></li>
                            <li><a href="#how-it-works" onClick={closeMenu}>Como Funciona</a></li>
                            <li><a href="#testimonials" onClick={closeMenu}>Depoimentos</a></li>
                            <li><a href="#pricing" onClick={closeMenu}>Preços</a></li>
                            <li><Link to="/ajuda" onClick={closeMenu}>Ajuda</Link></li>
                        </ul>
                    </nav>
                    <div className="header-actions">
                        <Link to="/login" className="btn btn-secondary btn-sm">Entrar</Link>
                        <Link to="/register" className="btn btn-primary">Começar Grátis</Link>
                    </div>
                    <button
                        className={`mobile-nav-toggle ${isMenuOpen ? 'is-active' : ''}`}
                        aria-label="Menu"
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
                            <div className="hero-badge">
                                <i className="fas fa-sparkles"></i>
                                Powered by GPT-5
                            </div>
                            <h1>
                                Memorize 10x mais rápido com
                                <span className="text-gradient"> Inteligência Artificial</span>
                            </h1>
                            <p className="hero-subtitle">
                                Transforme PDFs, vídeos e anotações em flashcards otimizados.
                                Nosso algoritmo de repetição espaçada garante que você nunca
                                esqueça o que aprendeu.
                            </p>
                            <div className="hero-actions">
                                <Link to="/register" className="btn btn-primary btn-lg">
                                    <i className="fas fa-rocket"></i>
                                    Começar Gratuitamente
                                </Link>
                                <button onClick={() => setVideoModalOpen(true)} className="btn-video">
                                    <span className="play-icon"><i className="fas fa-play"></i></span>
                                    <span>Ver Demo (2 min)</span>
                                </button>
                            </div>
                            <div className="hero-trust">
                                <p>
                                    <i className="fas fa-shield-check"></i>
                                    Mais de <strong>50.000 estudantes</strong> já aprovados
                                </p>
                            </div>
                        </div>
                        <div className="hero-visual">
                            <div className="hero-mockup">
                                <div className="floating-card card-1">
                                    <div className="card-header">
                                        <span className="card-badge">Biologia</span>
                                        <span className="card-progress">85%</span>
                                    </div>
                                    <h4>Mitocôndria</h4>
                                    <p>Organela responsável pela produção de ATP através da respiração celular</p>
                                </div>
                                <div className="floating-card card-2">
                                    <div className="card-header">
                                        <span className="card-badge">História</span>
                                        <span className="card-progress">92%</span>
                                    </div>
                                    <h4>Revolução Francesa</h4>
                                    <p>1789 - Queda da Bastilha marca o início do movimento revolucionário</p>
                                </div>
                                <div className="floating-card card-3">
                                    <div className="card-header">
                                        <span className="card-badge">Matemática</span>
                                        <span className="card-progress">78%</span>
                                    </div>
                                    <h4>Teorema de Pitágoras</h4>
                                    <p>a² + b² = c²</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="features">
                    <div className="landing-container">
                        <div className="section-header">
                            <span className="section-tag">RECURSOS</span>
                            <h2>Tudo que você precisa para dominar qualquer assunto</h2>
                            <p className="section-subtitle">
                                Combinamos neurociência e tecnologia para criar a plataforma
                                de estudos mais eficiente do mercado.
                            </p>
                        </div>
                        <div className="features-grid">
                            <FeatureCard
                                icon="fa-cloud"
                                title="Geração Inteligente"
                                description="IA analisa seu material e cria flashcards focados nos pontos mais importantes, economizando horas de preparação."
                                badge="Novo"
                            />
                            <FeatureCard
                                icon="fa-brain"
                                title="Repetição Espaçada"
                                description="Algoritmo baseado em neurociência que apresenta cards no momento ideal para maximizar retenção."
                            />
                            <FeatureCard
                                icon="fa-chart-line"
                                title="Analytics Detalhado"
                                description="Dashboards em tempo real mostram seu progresso, pontos fracos e previsão de desempenho."
                            />
                            <FeatureCard
                                icon="fa-file-pdf"
                                title="Multi-formato"
                                description="Importe PDFs, PowerPoints, vídeos do YouTube ou crie do zero. Suportamos todos os formatos."
                            />
                            <FeatureCard
                                icon="fa-mobile"
                                title="Estude em Qualquer Lugar"
                                description="Apps nativos para iOS e Android com sincronização em tempo real. Estude offline quando quiser."
                            />
                            <FeatureCard
                                icon="fa-users"
                                title="Modo Colaborativo"
                                description="Compartilhe decks, estude em grupo e compare seu progresso com amigos e colegas."
                            />
                        </div>
                    </div>
                </section>

                <section id="how-it-works" className="how-it-works">
                    <div className="landing-container">
                        <div className="section-header">
                            <span className="section-tag">PROCESSO SIMPLES</span>
                            <h2>Comece a memorizar em 3 passos</h2>
                            <p className="section-subtitle">
                                Setup em menos de 60 segundos. Sem cartão de crédito.
                            </p>
                        </div>
                        <div className="steps-container">
                            <StepCard
                                number="1"
                                icon="fa-upload"
                                title="Faça upload do material"
                                description="Arraste PDFs, links ou digite suas anotações diretamente na plataforma."
                            />
                            <StepCard
                                number="2"
                                icon="fa-star"
                                title="IA cria flashcards"
                                description="Nossa IA analisa e gera cards otimizados em segundos, prontos para revisar."
                            />
                            <StepCard
                                number="3"
                                icon="fa-graduation-cap"
                                title="Estude e domine"
                                description="Revise no momento ideal e acompanhe seu progresso até a maestria completa."
                            />
                        </div>
                    </div>
                </section>

                <section className="use-cases">
                    <div className="landing-container">
                        <div className="section-header">
                            <span className="section-tag">PARA TODOS</span>
                            <h2>Perfeito para cada tipo de aprendizado</h2>
                        </div>
                        <div className="tabs">
                            <div className="tab-buttons">
                                <button
                                    className={activeTab === 'students' ? 'active' : ''}
                                    onClick={() => setActiveTab('students')}
                                >
                                    <i className="fas fa-user-graduate"></i> Estudantes
                                </button>
                                <button
                                    className={activeTab === 'professionals' ? 'active' : ''}
                                    onClick={() => setActiveTab('professionals')}
                                >
                                    <i className="fas fa-briefcase"></i> Profissionais
                                </button>
                                <button
                                    className={activeTab === 'languages' ? 'active' : ''}
                                    onClick={() => setActiveTab('languages')}
                                >
                                    <i className="fas fa-language"></i> Idiomas
                                </button>
                            </div>
                            <div className="tab-content">
                                {activeTab === 'students' && (
                                    <div className="tab-pane">
                                        <h3>Aprovação garantida em vestibulares e concursos</h3>
                                        <p>
                                            Domine matérias complexas com flashcards que cobrem exatamente
                                            o que cai nas provas. Nossos usuários relatam aumento médio de
                                            40% nas notas após 30 dias de uso.
                                        </p>
                                        <ul className="check-list">
                                            <li><i className="fas fa-check"></i> Questões de provas anteriores</li>
                                            <li><i className="fas fa-check"></i> Simulados personalizados</li>
                                            <li><i className="fas fa-check"></i> Revisão pré-prova otimizada</li>
                                        </ul>
                                    </div>
                                )}
                                {activeTab === 'professionals' && (
                                    <div className="tab-pane">
                                        <h3>Mantenha-se atualizado e acelere sua carreira</h3>
                                        <p>
                                            Aprenda novas habilidades, certificações e conceitos técnicos
                                            em tempo recorde. Ideal para quem precisa absorver muito
                                            conteúdo rapidamente.
                                        </p>
                                        <ul className="check-list">
                                            <li><i className="fas fa-check"></i> Certificações profissionais</li>
                                            <li><i className="fas fa-check"></i> Treinamentos corporativos</li>
                                            <li><i className="fas fa-check"></i> Desenvolvimento contínuo</li>
                                        </ul>
                                    </div>
                                )}
                                {activeTab === 'languages' && (
                                    <div className="tab-pane">
                                        <h3>Fluência mais rápida com vocabulário sólido</h3>
                                        <p>
                                            Memorize vocabulário, gramática e expressões idiomáticas
                                            de forma natural. Nosso sistema adapta-se ao seu nível e
                                            velocidade de aprendizado.
                                        </p>
                                        <ul className="check-list">
                                            <li><i className="fas fa-check"></i> 5000+ palavras essenciais</li>
                                            <li><i className="fas fa-check"></i> Pronúncia com áudio nativo</li>
                                            <li><i className="fas fa-check"></i> Contexto e exemplos reais</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="testimonials" className="testimonials">
                    <div className="landing-container">
                        <div className="section-header">
                            <span className="section-tag">DEPOIMENTOS</span>
                            <h2>Histórias de sucesso reais</h2>
                            <p className="section-subtitle">
                                Veja como o Recall está transformando a forma como pessoas aprendem
                            </p>
                        </div>
                        <div className="testimonials-grid">
                            <TestimonialCard
                                name="Marina Silva"
                                role="Medicina"
                                institution="USP"
                                image="https://i.pravatar.cc/150?img=1"
                                rating={5}
                                text="Passei em primeiro lugar no vestibular! O Recall foi essencial para memorizar toda a anatomia e fisiologia. Recomendo demais!"
                            />
                            <TestimonialCard
                                name="Carlos Eduardo"
                                role="Engenheiro de Software"
                                institution="Google"
                                image="https://i.pravatar.cc/150?img=3"
                                rating={5}
                                text="Uso para estudar para certificações. Já passei em 3 exames este ano. A repetição espaçada é realmente eficaz."
                            />
                            <TestimonialCard
                                name="Ana Beatriz"
                                role="Concurseira"
                                institution="TRF aprovada"
                                image="https://i.pravatar.cc/150?img=5"
                                rating={5}
                                text="Depois de 2 anos tentando, finalmente passei! O Recall organizou meus estudos e me fez reter muito mais conteúdo."
                            />
                        </div>
                    </div>
                </section>

                {/* Preços */}
                <section id="pricing" className="pricing">
                    <div className="landing-container">
                        <div className="section-header">
                            <span className="section-tag">PLANOS</span>
                            <h2>Invista no seu futuro</h2>
                            <p className="section-subtitle">
                                Comece grátis. Faça upgrade quando quiser.
                            </p>
                        </div>
                        <div className="pricing-grid">
                            <PricingCard
                                name="Básico"
                                price="0"
                                period="mês"
                                features={[
                                    "100 flashcards/mês",
                                    "IA básica",
                                    "1 dispositivo",
                                    "Estatísticas simples"
                                ]}
                                ctaText="Começar Grátis"
                            />
                            <PricingCard
                                name="Pro"
                                price="29"
                                period="mês"
                                features={[
                                    "Flashcards ilimitados",
                                    "IA avançada (GPT-5",
                                    "Dispositivos ilimitados",
                                    "Analytics completo",
                                    "Modo offline",
                                    "Suporte prioritário"
                                ]}
                                highlighted={true}
                                ctaText="Teste 7 dias grátis"
                            />
                            <PricingCard
                                name="Equipe"
                                price="99"
                                period="mês"
                                features={[
                                    "Tudo do Pro",
                                    "5 usuários inclusos",
                                    "Colaboração em tempo real",
                                    "Admin dashboard",
                                    "API access",
                                    "Suporte dedicado"
                                ]}
                                ctaText="Falar com Vendas"
                            />
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="faq">
                    <div className="landing-container">
                        <div className="section-header">
                            <span className="section-tag">FAQ</span>
                            <h2>Perguntas frequentes</h2>
                        </div>
                        <div className="faq-grid">
                            <div className="faq-item">
                                <h3>Como funciona o período grátis?</h3>
                                <p>Você pode usar o plano básico para sempre ou testar o Pro por 7 dias sem compromisso. Não pedimos cartão de crédito.</p>
                            </div>
                            <div className="faq-item">
                                <h3>Posso cancelar a qualquer momento?</h3>
                                <p>Sim! Sem multas ou pegadinhas. Cancele com 1 clique e continue usando até o fim do período pago.</p>
                            </div>
                            <div className="faq-item">
                                <h3>Funciona para qualquer matéria?</h3>
                                <p>Absolutamente! De medicina a idiomas, passando por programação e história. Nossa IA adapta-se a qualquer conteúdo.</p>
                            </div>
                            <div className="faq-item">
                                <h3>E se eu já tiver meus próprios flashcards?</h3>
                                <p>Perfeito! Você pode importar de Anki, Quizlet e outros. Também pode criar cards manualmente quando quiser.</p>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <footer className="landing-footer">
                <div className="landing-container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <i className="fas fa-brain"></i>
                                <span>Recall</span>
                            </div>
                            <p>Aprendizado acelerado com inteligência artificial.</p>
                        </div>
                        <div className="footer-links">
                            <div className="footer-column">
                                <h4>Produto</h4>
                                <ul>
                                    <li><a href="#features">Recursos</a></li>
                                    <li><a href="#pricing">Preços</a></li>
                                    <li><Link to="/login">Login</Link></li>
                                    <li><Link to="/register">Cadastro</Link></li>
                                </ul>
                            </div>
                            <div className="footer-column">
                                <h4>Empresa</h4>
                                <ul>
                                    <li><Link to="/sobre">Sobre</Link></li>
                                    <li><Link to="/contato">Contato</Link></li>
                                </ul>
                            </div>
                            <div className="footer-column">
                                <h4>Suporte</h4>
                                <ul>
                                    <li><Link to="/ajuda">Central de Ajuda</Link></li>
                                    <li><Link to="/api-docs">API Docs</Link></li>
                                </ul>
                            </div>
                            <div className="footer-column">
                                <h4>Legal</h4>
                                <ul>
                                    <li><Link to="/privacidade">Privacidade</Link></li>
                                    <li><Link to="/termos">Termos</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; {new Date().getFullYear()} Recall. Todos os direitos reservados.</p>
                        <p className="footer-location">
                        </p>
                    </div>
                </div>
            </footer>

            <VideoModal isOpen={isVideoModalOpen} onClose={() => setVideoModalOpen(false)} />
        </>
    );
}

export default Landing;