const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { Server } = require("socket.io");

const authRoutes = require('./src/routes/authRoutes');
const deckRoutes = require('./src/routes/deckRoutes');
const flashcardRoutes = require('./src/routes/flashcardRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const shareRoutes = require('./src/routes/shareRoutes');
const achievementRoutes = require('./src/routes/achievementRoutes');
const communityRoutes = require('./src/routes/communityRoutes');
const quizSocketHandler = require('./src/socket/quizSocketHandler');

const app = express();
const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"], 
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', shareRoutes); 
app.use('/api/achievements', achievementRoutes);
app.use('/api/community', communityRoutes);

io.on('connection', (socket) => {
  console.log('Um utilizador conectou-se:', socket.id);

  quizSocketHandler(io, socket);

  socket.on('disconnect', () => {
    console.log('Um utilizador desconectou-se:', socket.id);
  });
});


const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor e WebSocket a rodar na porta ${PORT}`);
});

module.exports = app;