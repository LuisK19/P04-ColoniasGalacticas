const fs = require('fs');
const path = require('path');
const config = require('../config/config');

/**
 * Carga un archivo JSON de galaxia y construye el grafo en memoria.
 * @param {string} archivoPath - Ruta absoluta al archivo JSON
 * @returns {Object} - Objeto con sistemas (nodos) y adyacencia (aristas)
 */
function cargarGalaxia(archivoPath) {
  const raw = fs.readFileSync(archivoPath, 'utf-8');
  const data = JSON.parse(raw);

  // Construir mapa de sistemas con estado inicial
  const sistemas = {};
  for (const s of data.sistemas) {
    sistemas[s.id] = {
      id: s.id,
      nombre: s.nombre,
      tipo: s.tipo,
      propietario: null,          // null = libre
      estado: 'no_explorado',     // no_explorado | controlado
      flotas: 0,
      instalaciones: {
        minas: 0,
        centrales: 0,
        astilleros: 0,
        fortalezas: 0
      },
      produccion: config.juego.produccionPorTipo[s.tipo] || { minerales: 0, energia: 0, cristales: 0 }
    };
  }

  // Construir lista de adyacencia (grafo no dirigido)
  const adyacencia = {};
  for (const id of Object.keys(sistemas)) {
    adyacencia[id] = [];
  }

  for (const [a, b] of data.rutas) {
    adyacencia[a].push(b);
    adyacencia[b].push(a);
  }

  return {
    nombre: data.nombre,
    sistemas,
    adyacencia,
    rutasOriginales: data.rutas
  };
}

/**
 * Escanea la carpeta /galaxias y devuelve la lista de galaxias disponibles.
 * @returns {Array} - Lista de { nombre, archivo }
 */
function listarGalaxias() {
  const carpeta = path.join(__dirname, '../../galaxias');
  const archivos = fs.readdirSync(carpeta).filter(f => f.endsWith('.json'));

  return archivos.map(archivo => {
    const raw = fs.readFileSync(path.join(carpeta, archivo), 'utf-8');
    const data = JSON.parse(raw);
    return {
      nombre: data.nombre,
      archivo: archivo,
      totalSistemas: data.sistemas.length,
      totalRutas: data.rutas.length
    };
  });
}

module.exports = { cargarGalaxia, listarGalaxias };