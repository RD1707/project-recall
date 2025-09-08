import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import '../assets/css/landing.css'; 
import '../assets/css/contato.css';

function Contato() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        subject: '', 
        message: '' 
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Dados do formulário:", formData);
        toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        setFormData({ name: '', email: '', subject: '', message: '' }); 
    };

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
                         <Link to="/login" className="btn btn-primary">Começar Agora</Link>
                    </div>
                </div>
            </header>

            <main className="contato-main">
                 <section className="contato-hero">
                    <div className="landing-container">
                        <h1 className="contato-title">Estamos aqui para ajudar</h1>
                        <p className="contato-subtitle">
                            Tem alguma dúvida, sugestão ou feedback? Preencha o formulário abaixo ou entre em contato por um de nossos canais.
                        </p>
                    </div>
                </section>

                <section className="contato-form-section">
                    <div className="landing-container">
                        <div className="contato-wrapper">
                            <div className="contato-details">
                                <h3>Informações de Contato</h3>
                                <p>Nossa equipe de suporte está disponível para te auxiliar no que for preciso.</p>
                                <ul className="details-list">
                                    <li>
                                        <span className="icon"><i className="fas fa-envelope"></i></span>
                                        <div className="detail-info">
                                            <strong>E-mail</strong>
                                            <span>suporte@recall.com</span>
                                        </div>
                                    </li>
                                    <li>
                                        <span className="icon"><i className="fas fa-headset"></i></span>
                                        <div className="detail-info">
                                            <strong>Atendimento</strong>
                                            <span>Segunda a Sexta, das 9h às 18h</span>
                                        </div>
                                    </li>
                                     <li>
                                        <span className="icon"><i className="fas fa-question-circle"></i></span>
                                        <div className="detail-info">
                                            <strong>FAQ</strong>
                                            <span>Confira nossa <Link to="/ajuda">Central de Ajuda</Link></span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="contato-form-container">
                                <form onSubmit={handleSubmit} noValidate>
                                    <div className="form-group">
                                        <label htmlFor="name">Nome Completo</label>
                                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Seu nome" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Seu Melhor E-mail</label>
                                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="seu@email.com" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="subject">Assunto</label>
                                        <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required placeholder="Sobre o que você gostaria de falar?" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="message">Mensagem</label>
                                        <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows="5" placeholder="Digite sua mensagem aqui..."></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-block">Enviar Mensagem</button>
                                </form>
                            </div>
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

export default Contato;