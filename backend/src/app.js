const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const config = require('./config/config');

const authRoutes    = require('./routes/auth');
const gameRoutes    = require('./routes/games');
const galaxyRoutes  = require('./routes/galaxies');
const rankingRoutes = require('./routes/ranking');
const initSockets   = require('./sockets/index');

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

app.use('/auth',     authRoutes);
app.use('/games',    gameRoutes);
app.use('/galaxies', galaxyRoutes);
app.use('/ranking',  rankingRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

initSockets(io);

httpServer.listen(config.port, () => {
  console.log(`Servidor corriendo en http://localhost:${config.port}`);
});