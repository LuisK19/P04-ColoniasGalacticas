const express = require('express');
const router = express.Router();

// POST /auth — recibe nickname, devuelve token simple
router.post('/', (req, res) => {
  const { nickname } = req.body;
  if (!nickname || nickname.trim() === '') {
    return res.status(400).json({ error: 'Nickname requerido' });
  }
  // Por ahora devuelve el nickname como token, se expande después
  res.json({ token: nickname.trim(), nickname: nickname.trim() });
});

module.exports = router;