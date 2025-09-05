import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import '../assets/css/landing.css'; // Reutiliza estilos da landing page
import '../assets/css/ajuda.css';

// --- Dados Estáticos ---
// Definido fora do componente para evitar recriação a cada renderização
const faqData = [
    {
        question: "Como a IA do Recall gera os flashcards?",
        answer: "Nossa IA utiliza processamento de linguagem natural (PLN) para analisar seu conteúdo, identificar os conceitos e fatos mais importantes, e então criar perguntas e respostas pertinentes que otimizam a retenção do conhecimento."
    },
    {
        question: "Posso usar o Recall no meu celular?",
        answer: "Sim! O Recall é uma Aplicação Web Progressiva (PWA), totalmente responsiva. Ele funciona perfeitamente em navegadores de celulares e tablets, e você pode até 'instalá-lo' na sua tela inicial para uma experiência de app."
    },
    {
        question: "Quais tipos de arquivo são suportados para gerar flashcards?",
        answer: "Atualmente, aceitamos arquivos de texto (.txt, .md), PDFs, documentos Word (.docx) e links de vídeos do YouTube. Estamos sempre trabalhando para expandir o suporte a mais formatos."
    },
    {
        question: "O sistema de repetição espaçada é personalizável?",
        answer: "O algoritmo SM-2 funciona de forma automática com base no seu feedback ('Errei', 'Difícil', 'Bom', 'Fácil') para calcular o intervalo ideal de revisão. No momento, não há personalização manual dos intervalos."
    },
    {
        question: "Meus dados e materiais de estudo estão seguros?",
        answer: "Absolutamente. A segurança dos seus dados é nossa prioridade máxima. Utilizamos criptografia de ponta e seguimos as melhores práticas de segurança para garantir que seu material de estudo permaneça privado e seguro."
    }
];

// --- Subcomponentes para uma UI mais limpa e organizada ---

// Item do FAQ com foco em acessibilidade
const FaqItem = ({ question, answer, index }) => {
    const [isOpen, setIsOpen] = useState(false);
    const answerId = `faq-answer-${index}`;
    const questionId = `faq-question-${index}`;

    return (
        <div className={`faq-item ${isOpen ? 'active' : ''}`}>
            <div className="faq-question-header">
                <button
                    id={questionId}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setIsOpen(!isOpen)}
                    className="faq-question-button"
                >
                    <span className="faq-question-text">{question}</span>
                    <i className="fas fa-chevron-down faq-chevron"></i>
                </button>
            </div>
            <div
                id={answerId}
                role="region"
                aria-labelledby={questionId}
                className="faq-answer"
                style={{ maxHeight: isOpen ? '200px' : '0' }}
            >
                <p>{answer}</p>
            </div>
        </div>
    );
};

// Seção de Contato
const ContactSection = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Lógica de envio real seria implementada aqui (ex: API call)
        console.log("Dados do formulário:", formData);
        alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        setFormData({ name: '', email: '', subject: '', message: '' }); // Limpa o formulário
    };

    return (
        <section className="contact-section">
            <div className="landing-container">
                <div className="contact-container">
                    <div className="contact-info">
                        <h2>Fale Conosco</h2>
                        <p>Tem alguma dúvida, sugestão ou feedback? Preencha o formulário ou entre em contato por um de nossos canais. Nossa equipe está pronta para ajudar!</p>
                        <ul className="contact-details">
                            <li><span className="icon"><i className="fas fa-envelope"></i></span><span>suporte@recall.com</span></li>
                            <li><span className="icon"><i className="fas fa-headset"></i></span><span>Atendimento: Seg a Sex, 9h - 18h</span></li>
                        </ul>
                    </div>
                    <div className="contact-form-wrapper">
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-group">
                                <label htmlFor="name">Nome Completo</label>
                                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Seu Melhor E-mail</label>
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="subject">Assunto</label>
                                <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Mensagem</label>
                                <textarea id="message" name="message" value={formData.message} onChange={handleChange} required></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary btn-block">Enviar Mensagem</button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- Componente Principal da Página de Ajuda ---

function Ajuda() {
    // Rola para o topo da página ao carregar
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
                    <nav className="main-nav">
                        <ul>
                            <li><a href="/#features">Recursos</a></li>
                            <li><a href="/#how-it-works">Como Funciona</a></li>
                            <li><Link to="/ajuda">Ajuda</Link></li>
                        </ul>
                    </nav>
                    <div className="header-actions">
                         <Link to="/login" className="btn btn-primary">Começar Agora</Link>
                    </div>
                </div>
            </header>

            <main>
                <ContactSection />

                <section className="faq">
                    <div className="landing-container">
                        <div className="section-header">
                            <h2 className="section-title">Perguntas Frequentes</h2>
                            <p className="section-subtitle">Respostas rápidas para as dúvidas mais comuns de nossos usuários.</p>
                        </div>
                        <div className="faq-grid">
                            {faqData.map((item, index) => (
                                <FaqItem key={index} index={index} question={item.question} answer={item.answer} />
                            ))}
                        </div>
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

export default Ajuda;