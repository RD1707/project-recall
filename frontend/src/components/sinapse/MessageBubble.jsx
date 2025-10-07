import React from 'react';
import ReactMarkdown from 'react-markdown';

function MessageBubble({ message }) {
    const isUser = message.role === 'USER';
    const timestamp = new Date(message.created_at).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className={`sinapse-message ${isUser ? 'user-message' : 'assistant-message'}`}>
            <div className="message-avatar">
                {isUser ? (
                    <i className="fas fa-user"></i>
                ) : (
                    <i className="fas fa-brain"></i>
                )}
            </div>
            <div className="message-content-wrapper">
                <div className="message-header">
                    <span className="message-author">
                        {isUser ? 'Você' : 'Sinapse'}
                    </span>
                    <span className="message-timestamp">{timestamp}</span>
                </div>
                <div className="message-content">
                    {isUser ? (
                        <p>{message.content}</p>
                    ) : (
                        <ReactMarkdown
                            components={{
                                // Customizar renderização de elementos markdown
                                code: ({ node, inline, className, children, ...props }) => {
                                    return inline ? (
                                        <code className="inline-code" {...props}>
                                            {children}
                                        </code>
                                    ) : (
                                        <pre className="code-block">
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        </pre>
                                    );
                                },
                                a: ({ node, children, ...props }) => (
                                    <a {...props} target="_blank" rel="noopener noreferrer">
                                        {children}
                                    </a>
                                ),
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    )}
                </div>
                {message.attachments && message.attachments.length > 0 && (
                    <div className="message-attachments">
                        {message.attachments.map((attachment, index) => (
                            <div key={index} className="message-attachment-chip">
                                <i className="fas fa-paperclip"></i>
                                <span>{attachment.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MessageBubble;
