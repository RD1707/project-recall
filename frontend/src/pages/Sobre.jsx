import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/common/ThemeToggle';
import '../assets/css/landing.css';
import '../assets/css/sobre.css';
import '../assets/css/ThemeToggle.css';

const TechPill = ({ name }) => <span className="tech-pill">{name}</span>;

function Sobre() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <header className="landing-header">
                <div className="header-container landing-container">
                    <div className="logo">
                        <Link to="/">
                            <span className="logo-icon"><i className="fas fa-brain"></i></span>
                            Recall
                        </Link>
                    </div>
                    <div className="header-actions">
                         <ThemeToggle />
                         <Link to="/login" className="btn btn-primary">Começar Agora</Link>
                    </div>
                </div>
            </header>

            <main className="sobre-main">
                <section className="sobre-hero">
                    <div className="landing-container">
                        <h1 className="sobre-title">Nossa Missão é Potencializar o Conhecimento</h1>
                        <p className="sobre-subtitle">
                            Acreditamos que a tecnologia pode ser a maior aliada na jornada do aprendizado. O Recall nasceu da paixão por educação e inovação, com o objetivo de criar a ferramenta de estudos mais inteligente e eficiente do mercado.
                        </p>
                    </div>
                </section>

                <section className="sobre-content">
                    <div className="landing-container content-grid">
                        <div className="content-text">
                            <h2>A História por Trás do Recall</h2>
                            <p>
                                O Recall é uma plataforma inteligente de flashcards projetada para estudantes e profissionais que buscam otimizar seu tempo e maximizar a retenção de informações. Em um mundo com excesso de conteúdo, saber como estudar de forma eficaz é o verdadeiro diferencial.
                            </p>
                            <p>
                                Utilizando algoritmos de repetição espaçada (SM-2) e o poder da Inteligência Artificial generativa, nossa plataforma transforma materiais de estudo—sejam textos, documentos ou até vídeos do YouTube—em baralhos de estudo interativos e personalizados.
                            </p>
                            
                            <h2>Nossa Visão</h2>
                            <p>
                                Queremos democratizar o acesso a técnicas de estudo cientificamente comprovadas, tornando o aprendizado mais rápido, engajador e, acima de tudo, duradouro. Estamos constantemente pesquisando e implementando o que há de mais moderno em neurociência e tecnologia educacional para ajudar nossos usuários a alcançarem seus objetivos, seja passar em um concurso, aprender um novo idioma ou dominar uma habilidade profissional.
                            </p>
                        </div>
                        <div className="content-sidebar">
                            <div className="stack-card">
                                <h3>Stack Tecnológica</h3>
                                <p>Construído com as melhores ferramentas para performance e escalabilidade.</p>
                                <div className="tech-pills">
                                    <TechPill name="React" />
                                    <TechPill name="Node.js" />
                                    <TechPill name="PostgreSQL" />
                                    <TechPill name="Supabase" />
                                    <TechPill name="Cohere AI" />
                                    <TechPill name="Redis" />
                                    <TechPill name="BullMQ" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                 <section className="sobre-cta">
                    <div className="landing-container">
                        <h2>Junte-se a milhares de estudantes de sucesso</h2>
                        <p>Comece a transformar sua forma de aprender hoje mesmo. Crie sua conta gratuita.</p>
                        <Link to="/register" className="btn btn-primary btn-lg">Começar Gratuitamente</Link>
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
        </>
    );
}

export default Sobre;