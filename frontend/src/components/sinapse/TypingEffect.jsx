import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

function TypingEffect({ text, speed = 15, onComplete }) {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!text) return;

        let index = 0;
        setDisplayedText('');
        setIsComplete(false);

        const timer = setInterval(() => {
            if (index < text.length) {
                setDisplayedText((prev) => prev + text[index]);
                index++;
            } else {
                clearInterval(timer);
                setIsComplete(true);
                if (onComplete) {
                    onComplete();
                }
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed, onComplete]);

    return (
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
            {displayedText + (!isComplete ? '▊' : '')}
        </ReactMarkdown>
    );
}

export default TypingEffect;
