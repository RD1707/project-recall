import React from 'react';
import { Link } from 'react-router-dom';

function DeckCard({ deck, onEdit }) {
  const deckColor = deck.color || '#4f46e5';

  const handleOptionsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(); 
  };

  return (
    <Link to={`/deck/${deck.id}`} className="deck-card">
      <div className="deck-card-header" style={{ borderLeftColor: deckColor }}>
        <h3>{deck.title}</h3>
        <button className="deck-options-btn" aria-label="Opções do baralho" onClick={handleOptionsClick}>
          <i className="fas fa-ellipsis-v"></i>
        </button>
      </div>
      <div className="deck-card-body">
        <p>{deck.description || 'Sem descrição'}</p>
      </div>
      <div className="deck-card-footer">
        <span>{deck.card_count || 0} cards</span>
        <div className="btn btn-primary-static">Estudar</div>
      </div>
    </Link>
  );
}

export default DeckCard;