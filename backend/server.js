const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const deckRoutes = require('./src/routes/deckRoutes');
const flashcardRoutes = require('./src/routes/flashcardRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const shareRoutes = require('./src/routes/shareRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); // Middleware para parsear JSON

// Configuração das rotas da API com caminhos específicos
app.get('/api', (req, res) => {
  res.json({ message: 'API do Recall está funcionando!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/decks', deckRoutes); // Controla /api/decks e /api/decks/:id/flashcards
app.use('/api/flashcards', flashcardRoutes); // Controla /api/flashcards/:id
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', shareRoutes); // Controla /api/shared/:id

// Servir os arquivos estáticos do frontend (para produção)
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

// Rota catch-all para servir o index.html do React para qualquer outra rota
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

module.exports = app;