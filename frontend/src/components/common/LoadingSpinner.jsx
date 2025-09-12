import React from 'react';
import '../../assets/css/loading.css';

const LoadingSpinner = ({ message = "Carregando..." }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-box">
        <div className="spinner"></div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;