import React, { useState, useEffect, useRef } from 'react';
import { useSinapse } from '../../context/SinapseContext';
import ConversationSidebar from './ConversationSidebar';
import MessageBubble from './MessageBubble';
import FileAttachment from './FileAttachment';
import toast from 'react-hot-toast';
import '../../assets/css/sinapse.css';

function SinapseChat({ onBack }) {
    const {
        messages,
        isLoading,
        isSending,
        currentConversationId,
        sendMessage,
        createNewConversation,
    } = useSinapse();

    const [inputValue, setInputValue] = useState('');
    const [attachedFiles, setAttachedFiles] = useState([]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll para o final das mensagens
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focar input quando seleciona conversa
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentConversationId]);

    const handleSendMessage = async () => {
        const content = inputValue.trim();

        if (!content && attachedFiles.length === 0) {
            toast.error('Digite uma mensagem ou anexe um arquivo');
            return;
        }

        // Se não houver conversa selecionada, criar uma nova
        if (!currentConversationId) {
            try {
                await createNewConversation();
            } catch (error) {
                toast.error('Erro ao criar conversa');
                return;
            }
        }

        setInputValue('');
        const filesToSend = [...attachedFiles];
        setAttachedFiles([]);

        try {
            await sendMessage(content || 'Arquivo anexado', filesToSend);
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            toast.error('Erro ao enviar mensagem. Tente novamente.');
            // Restaurar mensagem se falhar
            setInputValue(content);
            setAttachedFiles(filesToSend);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleFileProcessed = (attachment) => {
        setAttachedFiles(prev => [...prev, attachment]);
    };

    const removeAttachment = (index) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="sinapse-chat">
                <ConversationSidebar />

                <div className="sinapse-main">
                    {/* Header */}
                    <div className="sinapse-header">
                        <button
                            className="sinapse-back-btn"
                            onClick={onBack}
                            aria-label="Voltar"
                        >
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <div className="sinapse-header-title">
                            <i className="fas fa-brain"></i>
                            <div>
                                <h3>Sinapse</h3>
                                <p>Assistente inteligente do Recall</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="sinapse-messages">
                        {!currentConversationId && messages.length === 0 ? (
                            <div className="sinapse-welcome">
                                <div className="welcome-icon">
                                    <i className="fas fa-brain"></i>
                                </div>
                                <h2>Olá! Eu sou a Sinapse</h2>
                                <p>
                                    Sou a assistente inteligente do Recall. Posso te ajudar com:
                                </p>
                                <div className="welcome-features">
                                    <div className="feature-item">
                                        <i className="fas fa-question-circle"></i>
                                        <span>Dúvidas sobre o sistema</span>
                                    </div>
                                    <div className="feature-item">
                                        <i className="fas fa-compass"></i>
                                        <span>Navegação e funcionalidades</span>
                                    </div>
                                    <div className="feature-item">
                                        <i className="fas fa-chart-line"></i>
                                        <span>Análise do seu progresso</span>
                                    </div>
                                    <div className="feature-item">
                                        <i className="fas fa-file-alt"></i>
                                        <span>Análise de arquivos</span>
                                    </div>
                                </div>
                                <p className="welcome-cta">
                                    Pergunte qualquer coisa ou envie um arquivo para começar!
                                </p>
                            </div>
                        ) : isLoading ? (
                            <div className="sinapse-loading">
                                <i className="fas fa-spinner fa-spin"></i>
                                <p>Carregando mensagens...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="sinapse-empty">
                                <i className="fas fa-comment-dots"></i>
                                <p>Nenhuma mensagem ainda. Comece a conversa!</p>
                            </div>
                        ) : (
                            <>
                                {messages.map((message) => (
                                    <MessageBubble key={message.id} message={message} />
                                ))}
                                {isSending && (
                                    <div className="sinapse-typing">
                                        <div className="typing-avatar">
                                            <i className="fas fa-brain"></i>
                                        </div>
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="sinapse-input-container">
                        {attachedFiles.length > 0 && (
                            <div className="attached-files">
                                {attachedFiles.map((file, index) => (
                                    <div key={index} className="attached-file-chip">
                                        <i className="fas fa-paperclip"></i>
                                        <span>{file.name}</span>
                                        <button
                                            onClick={() => removeAttachment(index)}
                                            className="remove-attachment"
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="sinapse-input-wrapper">
                            <FileAttachment onFileProcessed={handleFileProcessed} />

                            <textarea
                                ref={inputRef}
                                className="sinapse-input"
                                placeholder="Digite sua mensagem... (Shift+Enter para nova linha)"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isSending}
                                rows={1}
                            />

                            <button
                                className="sinapse-send-btn"
                                onClick={handleSendMessage}
                                disabled={isSending || (!inputValue.trim() && attachedFiles.length === 0)}
                            >
                                {isSending ? (
                                    <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                    <i className="fas fa-paper-plane"></i>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SinapseChat;
