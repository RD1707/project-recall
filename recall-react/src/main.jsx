import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast'; 
import App from './App.jsx';

import './assets/css/base.css';
import './assets/css/header.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    {/* O Toaster permite que as notificações apareçam em qualquer lugar da app */}
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#374151', 
          color: '#ffffff',     
        },
      }}
    />
  </React.StrictMode>,
);