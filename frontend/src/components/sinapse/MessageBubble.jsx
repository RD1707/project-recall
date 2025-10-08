import React from 'react';
import ReactMarkdown from 'react-markdown';
import TypingEffect from './TypingEffect';

function MessageBubble({ message, user, isTyping = false }) {
    const isUser = message.role === 'USER';
    const timestamp = new Date(message.created_at).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className={`sinapse-message ${isUser ? 'user-message' : 'assistant-message'}`}>

            <div className="message-content-wrapper">
                <div className="message-header">
                    <span className="message-author">
                        {isUser ? 'Você' : 'Sinapse'}
                    </span>
                    <span className="message-timestamp">{timestamp}</span>
                </div>
                <div className="message-content">
                    {isUser ? (
                        <ReactMarkdown
                            components={{
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
                    ) : isTyping ? (
                        <TypingEffect text={message.content} speed={15} />
                    ) : (
                        <ReactMarkdown
                            components={{
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
