const express = require('express');
const router = express.Router();

// GET /ranking — placeholder
router.get('/', (req, res) => {
  res.json({ ranking: [] });
});

module.exports = router;