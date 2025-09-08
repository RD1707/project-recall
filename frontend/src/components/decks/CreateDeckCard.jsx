import React from 'react';

function CreateDeckCard({ onClick }) {
  return (
    <div className="create-new-card" onClick={onClick}>
        <div className="create-new-card__icon">
          <i className="fas fa-plus"></i>
        </div>
        <h3 className="create-new-card__title">Criar Novo Baralho</h3>
    </div>
  );
}

export default CreateDeckCard;