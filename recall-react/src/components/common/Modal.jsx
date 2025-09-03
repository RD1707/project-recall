import React from 'react';
function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) {
    return null; 
  }

  return (
    <div className="modal-overlay visible" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-modal-btn" onClick={onClose} aria-label="Fechar modal">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;