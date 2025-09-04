const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Importação das rotas
const authRoutes = require('./src/routes/authRoutes');
const deckRoutes = require('./src/routes/deckRoutes');
const flashcardRoutes = require('./src/routes/flashcardRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const shareRoutes = require('./src/routes/shareRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares essenciais
app.use(cors());
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// --- ROTAS DA API ---
// A ordem aqui é importante. As rotas mais específicas vêm primeiro.
app.get('/api', (req, res) => {
  res.json({ message: 'API do Recall está funcionando!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/decks', deckRoutes);           // Gerencia /api/decks E /api/decks/:id/flashcards
app.use('/api/flashcards', flashcardRoutes); // Gerencia /api/flashcards/:id
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', shareRoutes);                // Gerencia /api/shared/:id (é o último para não conflitar)


// --- SERVIR O FRONTEND (PARA PRODUÇÃO) ---
// Em desenvolvimento, o Vite cuida disso. Em produção, o Node servirá os arquivos.
// Certifique-se de que a pasta 'dist' existe no frontend após rodar 'npm run build'
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));

// Rota "catch-all": Qualquer requisição GET que não seja para a API
// deve servir o index.html do React, permitindo que o React Router cuide da rota.
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

module.exports = app;