import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import '../assets/css/landing.css';
import '../assets/css/ajuda.css';

const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`faq-item ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
            <div className="faq-question">
                <h4>{question}</h4>
                <i className="fas fa-chevron-down"></i>
            </div>
            <div className="faq-answer" style={{ maxHeight: isOpen ? '300px' : '0' }}>
                <p>{answer}</p>
            </div>
        </div>
    );
};


function Ajuda() {
    const faqData = [
        {
            question: "Como a IA gera os flashcards?",
            answer: "Nossa IA utiliza processamento de linguagem natural para identificar conceitos-chave, fatos importantes e relações entre ideias no seu material de estudo, criando perguntas e respostas relevantes."
        },
        {
            question: "Posso usar o Recall no meu celular?",
            answer: "Sim! O Recall é totalmente responsivo e funciona perfeitamente em navegadores de celulares e tablets, adaptando-se a qualquer tamanho de tela."
        },
        {
            question: "Quais tipos de arquivo são suportados?",
            answer: "Aceitamos PDFs, documentos de texto (.txt, .md), e links do YouTube. Estamos sempre trabalhando para adicionar suporte a mais formatos."
        },
        {
            question: "Posso cancelar minha assinatura a qualquer momento?",
            answer: "Sim, você pode cancelar sua assinatura a qualquer momento sem taxas adicionais. Se cancelar no meio do período, terá acesso até o final do ciclo pago."
        }
    ];
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
                            <li><a href="/#demo">Demonstração</a></li>
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
                <section className="contact-section">
                    <div className="landing-container">
                        <div className="contact-container">
                            <div className="contact-info">
                                <h2>Fale Conosco</h2>
                                <p>Tem alguma dúvida ou sugestão? Preencha o formulário ao lado ou entre em contato por um de nossos canais. Nossa equipe está pronta para ajudar!</p>
                                <ul className="contact-details">
                                    <li>
                                        <span className="icon"><i className="fas fa-envelope"></i></span>
                                        <span>suporte@recallapp.com.br</span>
                                    </li>
                                    <li>
                                        <span className="icon"><i className="fas fa-phone"></i></span>
                                        <span>+55 (71) 99999-0000 (WhatsApp)</span>
                                    </li>
                                     <li>
                                        <span className="icon"><i className="fas fa-clock"></i></span>
                                        <span>Segunda a Sexta, das 9h às 18h</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="contact-form-wrapper">
                                <form onSubmit={(e) => { e.preventDefault(); alert('Formulário enviado!'); }}>
                                    <div className="form-group">
                                        <label htmlFor="name">Nome Completo</label>
                                        <input type="text" id="name" name="name" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Seu Melhor E-mail</label>
                                        <input type="email" id="email" name="email" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="subject">Assunto</label>
                                        <input type="text" id="subject" name="subject" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="message">Mensagem</label>
                                        <textarea id="message" name="message" required></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-block">Enviar Mensagem</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="faq">
                    <div className="landing-container">
                        <div className="section-header">
                            <h2 className="section-title">Perguntas Frequentes</h2>
                            <p className="section-subtitle">Respostas rápidas para as dúvidas mais comuns dos nossos usuários.</p>
                        </div>
                        <div className="faq-grid">
                            {faqData.map((item, index) => (
                                <FaqItem key={index} question={item.question} answer={item.answer} />
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