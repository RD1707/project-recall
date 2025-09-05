import React, { memo } from 'react';

const CreateDeckCard = memo(({ onClick }) => {
  const tips = [
    "Organize seus estudos por temas",
    "Use IA para criar cards automaticamente",
    "Revise diariamente para fixar o conteúdo",
    "Crie baralhos específicos para cada matéria"
  ];
  
  // Seleciona uma dica aleatória
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div 
      className="deck-card create-new" 
      onClick={onClick} 
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label="Criar novo baralho de flashcards"
    >
      <div className="deck-card-inner">
        <div className="create-icon">
          <i className="fas fa-plus"></i>
        </div>
        
        <h3>Criar Novo Baralho</h3>
        
        <p className="create-tip">
          {randomTip}
        </p>
        
        <div className="create-shortcuts">
          <span className="shortcut-badge">
            <i className="fas fa-keyboard"></i>
            Ctrl + N
          </span>
        </div>
      </div>
    </div>
  );
});

CreateDeckCard.displayName = 'CreateDeckCard';

// Estilos adicionais (adicione ao seu dashboard.css)
const additionalStyles = `
.create-new {
  position: relative;
  overflow: hidden;
}

.create-new::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.1) 0%,
    transparent 70%
  );
  animation: pulse 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.create-tip {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  margin: 0.75rem 0;
  line-height: 1.4;
  max-width: 200px;
  margin-left: auto;
  margin-right: auto;
}

.create-shortcuts {
  margin-top: 1rem;
}

.shortcut-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-family: 'Monaco', 'Courier New', monospace;
}

.shortcut-badge i {
  font-size: 0.625rem;
  opacity: 0.7;
}

.create-new:hover .shortcut-badge {
  background: var(--color-primary-100);
  border-color: var(--color-primary-200);
  color: var(--color-primary-600);
}

/* Animação de entrada especial para o card de criar */
.create-new {
  animation: bounceIn 0.6s ease-out;
  animation-delay: 0.3s;
  animation-fill-mode: both;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Estado de foco para acessibilidade */
.create-new:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Micro-interação no hover */
.create-new:hover .create-icon {
  animation: rotate 0.5s ease-in-out;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(90deg);
  }
}
`;

export default CreateDeckCard;