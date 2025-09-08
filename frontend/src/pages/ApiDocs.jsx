import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import '../assets/css/landing.css'; 
import '../assets/css/apidocs.css';

const MethodBadge = ({ method }) => <span className={`method-badge ${method.toLowerCase()}`}>{method}</span>;

const Endpoint = ({ method, path, description, children }) => (
    <div className="endpoint">
        <div className="endpoint-header">
            <MethodBadge method={method} />
            <span className="endpoint-path">{path}</span>
        </div>
        <div className="endpoint-body">
            <p className="endpoint-description">{description}</p>
            {children}
        </div>
    </div>
);

const CodeBlock = ({ children }) => (
    <pre className="code-block">
        <code>{JSON.stringify(children, null, 2)}</code>
    </pre>
);

function ApiDocs() {
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

            <main className="apidocs-main">
                <div className="landing-container apidocs-container">
                    <aside className="apidocs-sidebar">
                        <nav>
                            <h3>Documentação da API</h3>
                            <ul>
                                <li><a href="#introducao">Introdução</a></li>
                                <li><a href="#autenticacao">Autenticação</a></li>
                                <li><a href="#baralhos">Baralhos (Decks)</a></li>
                                <li><a href="#flashcards">Flashcards</a></li>
                            </ul>
                        </nav>
                    </aside>

                    <div className="apidocs-content">
                        <section id="introducao">
                            <h1>API Recall</h1>
                            <p>Bem-vindo à documentação da API do Recall. Esta API permite a integração com os principais recursos da nossa plataforma, como gerenciamento de baralhos e flashcards.</p>
                            <p>O base URL para todas as requisições é: <strong>/api</strong></p>
                        </section>

                        <section id="autenticacao">
                            <h2>Autenticação</h2>
                            <p>A maioria dos endpoints requer um token de autenticação. O token (access_token) é obtido após o login e deve ser enviado no header <code>Authorization</code> como um Bearer token.</p>
                            <pre className="code-block"><code>Authorization: Bearer SEU_ACCESS_TOKEN</code></pre>
                        </section>

                        <section id="baralhos">
                            <h2>Baralhos (Decks)</h2>
                            
                            <Endpoint method="GET" path="/decks" description="Retorna uma lista de todos os baralhos do usuário autenticado.">
                                <h4>Exemplo de Resposta:</h4>
                                <CodeBlock>{[{ id: 1, title: "Biologia Celular", description: "Conceitos básicos", card_count: 25 }]}</CodeBlock>
                            </Endpoint>

                             <Endpoint method="POST" path="/decks" description="Cria um novo baralho.">
                                <h4>Corpo da Requisição (JSON):</h4>
                                <CodeBlock>{{ title: "História do Brasil", description: "Período colonial", color: "#ef4444" }}</CodeBlock>
                            </Endpoint>
                            
                            <Endpoint method="PUT" path="/decks/:id" description="Atualiza as informações de um baralho existente.">
                                 <h4>Corpo da Requisição (JSON):</h4>
                                <CodeBlock>{{ title: "História do Brasil - Revisado" }}</CodeBlock>
                            </Endpoint>

                            <Endpoint method="DELETE" path="/decks/:id" description="Exclui um baralho e todos os seus flashcards associados." />
                        </section>
                        
                        <section id="flashcards">
                            <h2>Flashcards</h2>
                            
                            <Endpoint method="GET" path="/decks/:deckId/flashcards" description="Retorna todos os flashcards de um baralho específico.">
                                <h4>Exemplo de Resposta:</h4>
                                <CodeBlock>{[{ id: 101, question: "O que é uma mitocôndria?", answer: "Organela responsável pela respiração celular." }]}</CodeBlock>
                            </Endpoint>

                             <Endpoint method="POST" path="/decks/:deckId/flashcards" description="Cria um novo flashcard dentro de um baralho.">
                                <h4>Corpo da Requisição (JSON):</h4>
                                <CodeBlock>{{ question: "Qual a capital do Brasil?", answer: "Brasília" }}</CodeBlock>
                            </Endpoint>
                            
                            <Endpoint method="PUT" path="/flashcards/:cardId" description="Atualiza o conteúdo de um flashcard.">
                                 <h4>Corpo da Requisição (JSON):</h4>
                                <CodeBlock>{{ answer: "Brasília (DF)" }}</CodeBlock>
                            </Endpoint>

                            <Endpoint method="DELETE" path="/flashcards/:cardId" description="Exclui um flashcard específico." />
                        </section>

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

export default ApiDocs;