import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import '../assets/css/landing.css'; 
import '../assets/css/privacidade.css';
import '../assets/css/termos.css'; 

function Termos() {
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
                         <Link to="/login" className="btn btn-primary">Começar Agora</Link>
                    </div>
                </div>
            </header>

            <main className="termos-main">
                <section className="termos-hero">
                    <div className="landing-container">
                        <div className="hero-content">
                            <div className="hero-icon">
                                <i className="fas fa-file-contract"></i>
                            </div>
                            <h1 className="termos-title">Termos de Uso</h1>
                            <p className="termos-subtitle">
                                Transparência e clareza em cada palavra. Conheça os termos que regem sua experiência no Recall.
                            </p>
                            <p className="last-updated">Última atualização: 07 de setembro de 2025</p>
                        </div>
                    </div>
                </section>

                <section className="termos-content">
                    <div className="landing-container">
                        <div className="content-wrapper">
                            <div className="content-intro">
                                <p>Estes Termos de Uso ("Termos") governam seu acesso e uso da plataforma Recall ("Serviço"). Ao acessar ou usar o Serviço, você concorda em cumprir estes Termos.</p>
                            </div>

                            <div className="terms-sections">
                                <div className="term-section">
                                    <div className="section-icon">
                                        <i className="fas fa-handshake"></i>
                                    </div>
                                    <div className="section-content">
                                        <h2>1. Aceitação dos Termos</h2>
                                        <p>Ao criar uma conta ou usar o Recall, você confirma que leu, entendeu e concorda em ficar vinculado a estes Termos. Se você não concorda com os Termos, não deve usar o Serviço.</p>
                                    </div>
                                </div>

                                <div className="term-section">
                                    <div className="section-icon">
                                        <i className="fas fa-user-cog"></i>
                                    </div>
                                    <div className="section-content">
                                        <h2>2. Contas de Usuário</h2>
                                        <p>Para acessar a maioria dos recursos do Recall, você deve se registrar para uma conta. Você concorda em:</p>
                                        <ul>
                                            <li>Fornecer informações precisas, atuais e completas durante o processo de registro.</li>
                                            <li>Manter a segurança de sua senha e não divulgá-la a terceiros.</li>
                                            <li>Assumir total responsabilidade por todas as atividades que ocorram em sua conta.</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="term-section">
                                    <div className="section-icon">
                                        <i className="fas fa-edit"></i>
                                    </div>
                                    <div className="section-content">
                                        <h2>3. Conteúdo Gerado pelo Usuário</h2>
                                        <p>Você é o único responsável por todo o conteúdo que cria, envia ou armazena na plataforma, incluindo baralhos, flashcards e materiais de estudo ("Conteúdo do Usuário"). Você retém todos os direitos de propriedade sobre seu Conteúdo do Usuário.</p>
                                        <p>Ao usar os recursos de geração por IA, você entende que o conteúdo gerado é baseado no material que você fornece e que o Recall não garante a precisão ou a completude das informações geradas.</p>
                                    </div>
                                </div>
                                
                                <div className="term-section">
                                    <div className="section-icon">
                                        <i className="fas fa-ban"></i>
                                    </div>
                                    <div className="section-content">
                                        <h2>4. Conduta Proibida</h2>
                                        <p>Você concorda em não usar o Serviço para:</p>
                                        <ul>
                                            <li>Violar quaisquer leis ou regulamentos aplicáveis.</li>
                                            <li>Enviar conteúdo que seja ilegal, prejudicial, odioso ou que infrinja os direitos de propriedade intelectual de terceiros.</li>
                                            <li>Tentar obter acesso não autorizado aos nossos sistemas ou contas de outros usuários.</li>
                                            <li>Interferir ou interromper a integridade ou o desempenho do Serviço.</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="term-section">
                                    <div className="section-icon">
                                        <i className="fas fa-times-circle"></i>
                                    </div>
                                    <div className="section-content">
                                        <h2>5. Rescisão</h2>
                                        <p>Nós podemos suspender ou encerrar seu acesso ao Serviço a qualquer momento, por qualquer motivo, incluindo a violação destes Termos. Após a rescisão, seu direito de usar o Serviço cessará imediatamente.</p>
                                    </div>
                                </div>

                                <div className="term-section">
                                    <div className="section-icon">
                                        <i className="fas fa-shield-alt"></i>
                                    </div>
                                    <div className="section-content">
                                        <h2>6. Isenção de Garantias e Limitação de Responsabilidade</h2>
                                        <p>O Serviço é fornecido "como está", sem garantias de qualquer tipo. O Recall não garante que o serviço será ininterrupto, seguro ou livre de erros. Em nenhuma circunstância o Recall será responsável por quaisquer danos indiretos, incidentais ou consequenciais decorrentes do uso do serviço.</p>
                                    </div>
                                </div>
                                
                                <div className="term-section">
                                    <div className="section-icon">
                                        <i className="fas fa-envelope"></i>
                                    </div>
                                    <div className="section-content">
                                        <h2>7. Contato</h2>
                                        <p>Se você tiver alguma dúvida sobre estes Termos de Uso, entre em contato conosco em <a href="mailto:suporte@recall.com">suporte@recall.com</a>.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="termos-cta">
                    <div className="landing-container">
                        <div className="cta-content">
                            <h2>Pronto para começar?</h2>
                            <p>Aceite os termos e transforme sua forma de aprender com a plataforma mais inteligente de estudos.</p>
                            <Link to="/register" className="btn btn-primary btn-lg">Criar Conta Gratuita</Link>
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

export default Termos;