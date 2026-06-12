const express = require('express');
const router = express.Router();
const gameManager = require('../game/GameManager');
const db = require('../db/index');

/**
 * GET /games — lista todas las partidas disponibles
 */
router.get('/', (req, res) => {
  const partidas = gameManager.listarPartidas();
  res.json({ partidas });
});

/**
 * GET /games/:id — detalle de una partida
 */
router.get('/:id', (req, res) => {
  const partida = gameManager.obtenerPartida(req.params.id);
  if (!partida) return res.status(404).json({ error: 'Partida no encontrada' });
  res.json({ partida });
});

/**
 * POST /games — crear nueva partida
 * Body: { nombre, galaxiaArchivo, maxJugadores, tiempoMaximo, nivelRecursos }
 */
router.post('/', async (req, res) => {
  const { nombre, galaxiaArchivo, maxJugadores, tiempoMaximo, nivelRecursos } = req.body;

  if (!nombre || !galaxiaArchivo || !maxJugadores || !tiempoMaximo || !nivelRecursos) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const partida = gameManager.crearPartida({ nombre, galaxiaArchivo, maxJugadores, tiempoMaximo, nivelRecursos });

    // Persistir en BD
    await db.query(
      `INSERT INTO partidas (id, nombre, galaxia, max_jugadores, tiempo_maximo, nivel_recursos)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [partida.id, partida.nombre, partida.galaxiaNombre, partida.maxJugadores, partida.tiempoMaximo, partida.nivelRecursos]
    );

    res.status(201).json({ partida });
  } catch (error) {
    console.error('Error creando partida:', error.message);
    res.status(500).json({ error: 'Error al crear la partida' });
  }
});

/**
 * POST /games/:id/join — unirse a una partida
 * Body: { nickname }
 */
router.post('/:id/join', async (req, res) => {
  const { nickname } = req.body;
  if (!nickname) return res.status(400).json({ error: 'Nickname requerido' });

  const resultado = gameManager.unirsePartida(req.params.id, nickname);
  if (!resultado.ok) return res.status(400).json({ error: resultado.error });

  try {
    await db.query(
      `INSERT INTO jugadores_partida (partida_id, nickname) VALUES ($1, $2)`,
      [req.params.id, nickname]
    );
  } catch (error) {
    console.error('Error guardando jugador en BD:', error.message);
    // No bloqueamos el juego si falla BD en este punto
  }

  res.json({ partida: resultado.partida });
});

module.exports = router;