const express = require('express');
const router = express.Router();
const { listarGalaxias } = require('../game/GalaxyLoader');

/**
 * GET /galaxies
 * Devuelve la lista de galaxias disponibles en la carpeta /galaxias
 */
router.get('/', (req, res) => {
  try {
    const galaxias = listarGalaxias();
    res.json({ galaxias });
  } catch (error) {
    console.error('Error listando galaxias:', error.message);
    res.status(500).json({ error: 'Error al cargar las galaxias' });
  }
});

module.exports = router;