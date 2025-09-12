import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import '../assets/css/landing.css'; 
import '../assets/css/privacidade.css';

function Privacidade() {
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

            <main className="legal-main">
                <div className="landing-container legal-container">
                    <div className="legal-header">
                        <h1>Política de Privacidade</h1>
                        <p className="last-updated">Última atualização: 07 de setembro de 2025</p>
                    </div>
                    <div className="legal-content">
                        <p>Bem-vindo ao Recall. A sua privacidade é de extrema importância para nós. Esta Política de Privacidade descreve como coletamos, usamos, processamos e protegemos suas informações em conjunto com seu acesso e uso da plataforma Recall.</p>

                        <h2>1. Informações que Coletamos</h2>
                        <p>Coletamos três categorias principais de informações:</p>
                        <ul>
                            <li><strong>Informações que Você nos Fornece:</strong> Isso inclui as informações que você insere ao criar uma conta, como seu nome completo, nome de usuário, endereço de e-mail e senha. Também inclui qualquer conteúdo que você cria na plataforma, como títulos de baralhos, descrições, perguntas e respostas de flashcards.</li>
                            <li><strong>Informações Coletadas Automaticamente:</strong> Quando você usa o Recall, coletamos automaticamente informações sobre seu uso, como seu progresso de estudo, respostas em sessões de revisão (acertos, erros), frequência de acesso e dados de interação com a interface.</li>
                            <li><strong>Informações de Terceiros:</strong> Se você optar por se registrar ou fazer login usando um serviço de terceiros (como o Google), receberemos informações desse serviço, como seu nome e endereço de e-mail, conforme permitido por suas configurações de privacidade nesse serviço.</li>
                        </ul>

                        <h2>2. Como Usamos Suas Informações</h2>
                        <p>Utilizamos as informações coletadas para os seguintes fins:</p>
                        <ul>
                            <li>Fornecer, operar e melhorar a plataforma Recall.</li>
                            <li>Personalizar sua experiência de aprendizado, aplicando nosso algoritmo de repetição espaçada.</li>
                            <li>Comunicar-nos com você sobre sua conta, atualizações do sistema e suporte.</li>
                            <li>Analisar o uso da plataforma para entender como nossos usuários aprendem e como podemos melhorar nossos serviços.</li>
                            <li>Garantir a segurança e a integridade de nossa plataforma.</li>
                        </ul>

                        <h2>3. Compartilhamento e Divulgação</h2>
                        <p>Não vendemos nem alugamos suas informações pessoais a terceiros. Podemos compartilhar informações nas seguintes circunstâncias:</p>
                        <ul>
                            <li><strong>Com seu Consentimento:</strong> Como ao usar a funcionalidade de compartilhar um baralho, que torna o conteúdo visível para quem tiver o link.</li>
                            <li><strong>Para Processamento Externo:</strong> Fornecemos informações a prestadores de serviços confiáveis (como Supabase para banco de dados e Cohere para IA) que nos ajudam a operar a plataforma, sob estritas obrigações de confidencialidade.</li>
                            <li><strong>Por Razões Legais:</strong> Podemos divulgar informações se acreditarmos que é razoavelmente necessário para cumprir uma lei, regulamento ou processo legal.</li>
                        </ul>
                        
                        <h2>4. Segurança dos Dados</h2>
                        <p>Empregamos medidas de segurança técnicas e administrativas para proteger suas informações contra acesso não autorizado, perda, destruição ou alteração. Usamos criptografia para dados em trânsito e em repouso e seguimos as melhores práticas do setor.</p>

                        <h2>5. Seus Direitos</h2>
                        <p>Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Você pode gerenciar a maioria das suas informações diretamente nas configurações do seu perfil. Para solicitações adicionais, entre em contato conosco.</p>

                        <h2>6. Alterações a esta Política</h2>
                        <p>Podemos atualizar esta Política de Privacidade de tempos em tempos. Se fizermos alterações significativas, notificaremos você através da plataforma ou por e-mail.</p>
                        
                        <h2>7. Contato</h2>
                        <p>Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco em <a href="mailto:suporte@recall.com">suporte@recall.com</a>.</p>
                    </div>
                </div>
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

export default Privacidade;