const express = require('express');
const router = express.Router();

// GET /galaxies — placeholder, se implementa en día 2
router.get('/', (req, res) => {
  res.json({ galaxias: [] });
});

module.exports = router;