const express = require('express');
const router = express.Router();

// GET /games — placeholder
router.get('/', (req, res) => {
  res.json({ partidas: [] });
});

// POST /games — placeholder
router.post('/', (req, res) => {
  res.json({ mensaje: 'crear partida — próximamente' });
});

// POST /games/:id/join — placeholder
router.post('/:id/join', (req, res) => {
  res.json({ mensaje: 'unirse a partida — próximamente' });
});

module.exports = router;