import React from 'react';

function CreateDeckCard({ onClick }) {
  return (
    <div className="deck-card create-new" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="deck-card-inner">
        <div className="create-icon">
          <i className="fas fa-plus"></i>
        </div>
        <h3>Criar Novo Baralho</h3>
      </div>
    </div>
  );
}

export default CreateDeckCard;