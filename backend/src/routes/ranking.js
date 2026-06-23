const express = require('express');
const router = express.Router();
const db = require('../db/index');

/**
 * GET /ranking
 * Devuelve el historial de partidas con sus ganadores, ordenado por fecha descendente.
 */
router.get('/', async (req, res) => {
  try {
    const resultado = await db.query(
      `SELECT partida_id, ganador_nickname, sistemas_controlados,
              minerales, energia, cristales, galaxia,
              tiempo_juego_seg, fecha_partida
       FROM ranking
       ORDER BY fecha_partida DESC`
    );

    const ranking = resultado.rows.map(r => ({
      id:                  r.partida_id,
      ganadorNickname:      r.ganador_nickname,
      sistemasControlados: r.sistemas_controlados,
      minerales:            r.minerales,
      energia:              r.energia,
      cristales:            r.cristales,
      galaxia:              r.galaxia,
      tiempoJuego:          formatearTiempo(r.tiempo_juego_seg),
      fechaPartida:         r.fecha_partida
    }));

    res.json({ ranking });
  } catch (error) {
    console.error('Error obteniendo ranking:', error.message);
    res.status(500).json({ error: 'Error al obtener el ranking' });
  }
});

/**
 * Convierte segundos totales a formato mm:ss
 * @param {number} segundos
 * @returns {string}
 */
function formatearTiempo(segundos) {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${min}:${seg.toString().padStart(2, '0')}`;
}

module.exports = router;