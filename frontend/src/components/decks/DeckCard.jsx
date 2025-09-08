import React from 'react';
import { Link } from 'react-router-dom';

function DeckCard({ deck, onEdit }) {
  const deckColor = deck.color || '#6366f1';

  const handleOptionsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit();
  };

  return (
    <Link to={`/deck/${deck.id}`} className="deck-card">
      <div className="deck-card__header" style={{ '--deck-color': deckColor }}>
        <h3>{deck.title}</h3>
        <button className="deck-card__options-btn" aria-label="Opções do baralho" onClick={handleOptionsClick}>
          <i className="fas fa-ellipsis-v"></i>
        </button>
      </div>
      <div className="deck-card__body">
        <p>{deck.description || 'Sem descrição'}</p>
      </div>
      <div className="deck-card__footer">
        <span className="deck-card__card-count">
            <i className="fas fa-layer-group"></i>
            {deck.card_count || 0} cards
        </span>
        <div className="deck-card__study-btn">Estudar</div>
      </div>
    </Link>
  );
}

export default DeckCard;