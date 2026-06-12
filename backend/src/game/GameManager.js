const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { cargarGalaxia } = require('./GalaxyLoader');
const config = require('../config/config');

/**
 * GameManager — administra todas las partidas activas en memoria.
 * Una sola instancia corre en el servidor durante toda la vida del proceso.
 */
class GameManager {
  constructor() {
    // Mapa de partidas activas: { [partidaId]: Partida }
    this.partidas = {};
  }

  // =============================================
  // CREAR PARTIDA
  // =============================================

  /**
   * Crea una nueva partida y la registra en memoria.
   * @param {Object} opciones - nombre, galaxiaArchivo, maxJugadores, tiempoMaximo, nivelRecursos
   * @returns {Object} - La partida creada
   */
  crearPartida({ nombre, galaxiaArchivo, maxJugadores, tiempoMaximo, nivelRecursos }) {
    const id = uuidv4();
    const rutaGalaxia = path.join(__dirname, '../../galaxias', galaxiaArchivo);
    const galaxia = cargarGalaxia(rutaGalaxia);

    const partida = {
      id,
      nombre,
      galaxiaArchivo,
      galaxiaNombre: galaxia.nombre,
      maxJugadores: parseInt(maxJugadores),
      tiempoMaximo: parseInt(tiempoMaximo),   // minutos
      nivelRecursos,
      estado: 'esperando',                    // esperando | activa | finalizada
      jugadores: {},                          // { [nickname]: DatosJugador }
      sistemas: galaxia.sistemas,             // estado actual del mapa
      adyacencia: galaxia.adyacencia,
      rutasOriginales: galaxia.rutasOriginales,
      creadaEn: Date.now(),
      iniciadaEn: null,
      timerProduccion: null,                  // referencia al setInterval
      timerPartida: null                      // referencia al setTimeout de tiempo máximo
    };

    this.partidas[id] = partida;
    console.log(`Partida creada: ${nombre} (${id})`);
    return this._partidaPublica(partida);
  }

  // =============================================
  // UNIRSE A PARTIDA
  // =============================================

  /**
   * Agrega un jugador a una partida en espera.
   * @param {string} partidaId
   * @param {string} nickname
   * @returns {Object} - { ok, error, partida }
   */
  unirsePartida(partidaId, nickname) {
    const partida = this.partidas[partidaId];

    if (!partida)
      return { ok: false, error: 'Partida no encontrada' };
    if (partida.estado !== 'esperando')
      return { ok: false, error: 'La partida ya inició o finalizó' };
    if (partida.jugadores[nickname])
      return { ok: false, error: 'El nickname ya está en esta partida' };
    if (Object.keys(partida.jugadores).length >= partida.maxJugadores)
      return { ok: false, error: 'La partida está llena' };

    const recursosIniciales = config.juego.recursosIniciales[partida.nivelRecursos];

    partida.jugadores[nickname] = {
      nickname,
      minerales: recursosIniciales.minerales,
      energia: recursosIniciales.energia,
      cristales: recursosIniciales.cristales,
      sistemaBase: null,
      eliminado: false
    };

    console.log(`${nickname} se unió a la partida ${partida.nombre}`);
    return { ok: true, partida: this._partidaPublica(partida) };
  }

  // =============================================
  // LISTAR PARTIDAS
  // =============================================

  /**
   * Devuelve todas las partidas (resumen público).
   */
  listarPartidas() {
    return Object.values(this.partidas).map(p => this._partidaPublica(p));
  }

  /**
   * Devuelve una partida por id.
   */
  obtenerPartida(partidaId) {
    const partida = this.partidas[partidaId];
    if (!partida) return null;
    return this._partidaPublica(partida);
  }

  // =============================================
  // INICIAR PARTIDA
  // =============================================

  /**
   * Inicia la partida: asigna planetas base y arranca el ciclo de producción.
   * @param {string} partidaId
   * @param {Function} onTick - callback que se llama en cada ciclo de producción
   * @param {Function} onFin  - callback que se llama al terminar la partida
   * @returns {Object} - { ok, error, partida }
   */
  iniciarPartida(partidaId, onTick, onFin) {
    const partida = this.partidas[partidaId];

    if (!partida)
      return { ok: false, error: 'Partida no encontrada' };
    if (partida.estado !== 'esperando')
      return { ok: false, error: 'La partida ya fue iniciada' };

    const jugadores = Object.keys(partida.jugadores);
    if (jugadores.length < 2)
      return { ok: false, error: 'Se necesitan al menos 2 jugadores' };

    // Asignar planeta base aleatorio a cada jugador
    const sistemasDisponibles = Object.keys(partida.sistemas);
    const seleccionados = this._seleccionarAleatorios(sistemasDisponibles, jugadores.length);

    jugadores.forEach((nickname, i) => {
      const sistemaId = seleccionados[i];
      partida.jugadores[nickname].sistemaBase = sistemaId;
      partida.sistemas[sistemaId].propietario = nickname;
      partida.sistemas[sistemaId].estado = 'controlado';
      partida.sistemas[sistemaId].flotas = 3; // flotas iniciales
    });

    partida.estado = 'activa';
    partida.iniciadaEn = Date.now();

    // Ciclo de producción cada N segundos
    const intervalo = config.juego.cicloProduccionSeg * 1000;
    partida.timerProduccion = setInterval(() => {
      this._ejecutarCicloProduccion(partida);
      if (onTick) onTick(this._estadoJuegoCompleto(partida));
      this._verificarVictoria(partida, onFin);
    }, intervalo);

    // Tiempo máximo de partida
    const tiempoMaxMs = partida.tiempoMaximo * 60 * 1000;
    partida.timerPartida = setTimeout(() => {
      this._finalizarPartida(partida, 'tiempo', onFin);
    }, tiempoMaxMs);

    console.log(`Partida ${partida.nombre} iniciada con jugadores: ${jugadores.join(', ')}`);
    return { ok: true, partida: this._estadoJuegoCompleto(partida) };
  }

  // =============================================
  // CICLO DE PRODUCCIÓN
  // =============================================

  /**
   * Ejecuta un ciclo de producción: cada sistema controlado
   * genera recursos para su propietario.
   */
  _ejecutarCicloProduccion(partida) {
    for (const sistema of Object.values(partida.sistemas)) {
      if (sistema.estado !== 'controlado' || !sistema.propietario) continue;

      const jugador = partida.jugadores[sistema.propietario];
      if (!jugador || jugador.eliminado) continue;

      jugador.minerales += sistema.produccion.minerales;
      jugador.energia   += sistema.produccion.energia;
      jugador.cristales += sistema.produccion.cristales;

      // Bonus por centrales de investigación
      jugador.minerales += sistema.instalaciones.centrales * 50;
      jugador.energia   += sistema.instalaciones.centrales * 25;
      jugador.cristales += sistema.instalaciones.centrales * 10;
    }
  }

  // =============================================
  // CONSTRUCCIÓN
  // =============================================

  /**
   * Construye una instalación en un sistema controlado por el jugador.
   * @param {string} partidaId
   * @param {string} nickname
   * @param {string} sistemaId
   * @param {string} tipo - mina | central | astillero | fortaleza
   * @returns {Object} - { ok, error }
   */
  construir(partidaId, nickname, sistemaId, tipo) {
    const partida = this.partidas[partidaId];
    if (!partida) return { ok: false, error: 'Partida no encontrada' };

    const sistema = partida.sistemas[sistemaId];
    if (!sistema) return { ok: false, error: 'Sistema no encontrado' };
    if (sistema.propietario !== nickname) return { ok: false, error: 'No controlás este sistema' };

    const jugador = partida.jugadores[nickname];
    const costo = config.juego.costoInstalaciones[tipo];
    if (!costo) return { ok: false, error: 'Tipo de instalación inválido' };

    if (jugador.minerales < costo.minerales ||
        jugador.energia   < costo.energia   ||
        jugador.cristales < costo.cristales) {
      return { ok: false, error: 'Recursos insuficientes' };
    }

    // Descontar recursos
    jugador.minerales -= costo.minerales;
    jugador.energia   -= costo.energia;
    jugador.cristales -= costo.cristales;

    // Agregar instalación
    const mapa = { mina: 'minas', central: 'centrales', astillero: 'astilleros', fortaleza: 'fortalezas' };
    sistema.instalaciones[mapa[tipo]]++;

    return { ok: true, sistema, jugador };
  }

  // =============================================
  // MOVER FLOTAS
  // =============================================

  /**
   * Mueve flotas de un sistema a otro.
   * Valida conexión directa y que el destino no esté ocupado por un tercero.
   * @returns {Object} - { ok, error, combate }
   */
  moverFlotas(partidaId, nickname, origenId, destinoId, cantidad) {
    const partida = this.partidas[partidaId];
    if (!partida) return { ok: false, error: 'Partida no encontrada' };

    const origen  = partida.sistemas[origenId];
    const destino = partida.sistemas[destinoId];

    if (!origen || !destino) return { ok: false, error: 'Sistema no encontrado' };
    if (origen.propietario !== nickname) return { ok: false, error: 'No controlás el sistema origen' };
    if (origen.flotas < cantidad) return { ok: false, error: 'No tenés suficientes flotas' };
    if (cantidad <= 0) return { ok: false, error: 'Cantidad inválida' };

    // Verificar conexión directa en el grafo
    const vecinos = partida.adyacencia[origenId] || [];
    if (!vecinos.includes(destinoId)) {
      return { ok: false, error: 'Los sistemas no están conectados directamente' };
    }

    // Si el destino es libre o propio → mover sin combate
    if (!destino.propietario || destino.propietario === nickname) {
      origen.flotas -= cantidad;
      destino.flotas += cantidad;
      destino.propietario = nickname;
      destino.estado = 'controlado';
      return { ok: true, combate: false, origen, destino };
    }

    // Si el destino es de otro jugador → combate
    return this._resolverCombate(partida, nickname, origen, destino, cantidad);
  }

  // =============================================
  // COMBATE
  // =============================================

  /**
   * Resuelve un combate entre el invasor y el defensor.
   * Reglas: flotas 1:1, cada flota neutraliza 3 minas, 2 astilleros derriban 1 fortaleza.
   */
  _resolverCombate(partida, invasorNick, origen, destino, flotasInvasoras) {
    const defensorNick = destino.propietario;

    let fuerzaInvasor  = flotasInvasoras;
    let fuerzaDefensor = destino.flotas;

    // Neutralizar minas (cada flota del invasor elimina hasta 3 minas)
    const minasEliminadas = Math.min(destino.instalaciones.minas, Math.floor(fuerzaInvasor / 1));
    const flotasUsadasEnMinas = Math.ceil(minasEliminadas / 3);
    fuerzaInvasor  -= flotasUsadasEnMinas;
    destino.instalaciones.minas -= minasEliminadas;

    // Neutralizar fortalezas (2 astilleros por fortaleza)
    const fortalezasEliminadas = Math.min(destino.instalaciones.fortalezas, Math.floor(fuerzaInvasor / 2));
    const flotasUsadasEnFortalezas = fortalezasEliminadas * 2;
    fuerzaInvasor -= flotasUsadasEnFortalezas;
    destino.instalaciones.fortalezas -= fortalezasEliminadas;

    // Combate directo flota vs flota
    const bajasMutuas = Math.min(fuerzaInvasor, fuerzaDefensor);
    fuerzaInvasor  -= bajasMutuas;
    fuerzaDefensor -= bajasMutuas;

    const resultado = {
      invasor: invasorNick,
      defensor: defensorNick,
      sistemaId: destino.id,
      flotasInvasoras,
      ganador: null,
      detalle: { minasEliminadas, fortalezasEliminadas, bajasMutuas }
    };

    if (fuerzaInvasor > fuerzaDefensor) {
      // Invasor gana
      origen.flotas -= flotasInvasoras;
      destino.flotas = fuerzaInvasor;
      destino.propietario = invasorNick;
      destino.estado = 'controlado';
      // Conserva centrales del derrotado, elimina sus astilleros
      destino.instalaciones.astilleros = 0;
      resultado.ganador = invasorNick;

      // Verificar si el defensor quedó sin sistemas
      this._verificarEliminacion(partida, defensorNick);
    } else {
      // Defensor gana
      origen.flotas -= flotasInvasoras;
      destino.flotas = fuerzaDefensor;
      destino.instalaciones.minas -= Math.floor(bajasMutuas / 3);
      resultado.ganador = defensorNick;
    }

    return { ok: true, combate: true, resultado, origen, destino };
  }

  // =============================================
  // VERIFICACIONES
  // =============================================

  _verificarEliminacion(partida, nickname) {
    const tieneSistemas = Object.values(partida.sistemas)
      .some(s => s.propietario === nickname);

    if (!tieneSistemas) {
      partida.jugadores[nickname].eliminado = true;
      console.log(`${nickname} fue eliminado`);
    }
  }

  _verificarVictoria(partida, onFin) {
    const totalSistemas = Object.keys(partida.sistemas).length;
    const jugadoresActivos = Object.values(partida.jugadores).filter(j => !j.eliminado);

    // Condición c: solo queda un jugador
    if (jugadoresActivos.length === 1) {
      this._finalizarPartida(partida, 'ultimo_jugador', onFin);
      return;
    }

    // Condición a: un jugador controla el porcentaje configurado
    for (const jugador of jugadoresActivos) {
      const sistemasControlados = Object.values(partida.sistemas)
        .filter(s => s.propietario === jugador.nickname).length;

      const porcentaje = (sistemasControlados / totalSistemas) * 100;
      if (porcentaje >= config.juego.porcentajeVictoria) {
        this._finalizarPartida(partida, 'dominio', onFin);
        return;
      }
    }
  }

  _finalizarPartida(partida, motivo, onFin) {
    if (partida.estado === 'finalizada') return;

    clearInterval(partida.timerProduccion);
    clearTimeout(partida.timerPartida);

    partida.estado = 'finalizada';
    partida.finalizadaEn = Date.now();

    const ranking = this._calcularRanking(partida);
    console.log(`Partida ${partida.nombre} finalizada. Motivo: ${motivo}`);

    if (onFin) onFin({ partida: this._estadoJuegoCompleto(partida), ranking, motivo });
  }

  _calcularRanking(partida) {
    return Object.values(partida.jugadores)
      .map(j => {
        const sistemas = Object.values(partida.sistemas).filter(s => s.propietario === j.nickname);
        const minas      = sistemas.reduce((sum, s) => sum + s.instalaciones.minas, 0);
        const centrales  = sistemas.reduce((sum, s) => sum + s.instalaciones.centrales, 0);
        const astilleros = sistemas.reduce((sum, s) => sum + s.instalaciones.astilleros, 0);
        const fortalezas = sistemas.reduce((sum, s) => sum + s.instalaciones.fortalezas, 0);

        const puntaje =
          sistemas.length   * 5000 +
          j.minerales        * 1    +
          j.energia          * 2    +
          j.cristales        * 3    +
          fortalezas         * 100  +
          centrales          * 150;

        return {
          nickname: j.nickname,
          puntaje,
          sistemasControlados: sistemas.length,
          minerales: j.minerales,
          energia: j.energia,
          cristales: j.cristales,
          flotas: sistemas.reduce((sum, s) => sum + s.flotas, 0),
          minas, centrales, astilleros, fortalezas,
          eliminado: j.eliminado
        };
      })
      .sort((a, b) => b.puntaje - a.puntaje)
      .map((j, i) => ({ ...j, posicion: i + 1 }));
  }

  // =============================================
  // HELPERS
  // ============================================

  _seleccionarAleatorios(arr, n) {
    const copia = [...arr];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia.slice(0, n);
  }

  /** Versión pública de una partida (sin timers ni datos internos) */
  _partidaPublica(partida) {
    return {
      id: partida.id,
      nombre: partida.nombre,
      galaxiaNombre: partida.galaxiaNombre,
      galaxiaArchivo: partida.galaxiaArchivo,
      maxJugadores: partida.maxJugadores,
      tiempoMaximo: partida.tiempoMaximo,
      nivelRecursos: partida.nivelRecursos,
      estado: partida.estado,
      jugadores: Object.keys(partida.jugadores),
      cantidadJugadores: Object.keys(partida.jugadores).length,
      creadaEn: partida.creadaEn
    };
  }

  /** Estado completo del juego (para emitir por WebSocket durante la partida) */
  _estadoJuegoCompleto(partida) {
    return {
      id: partida.id,
      nombre: partida.nombre,
      estado: partida.estado,
      sistemas: partida.sistemas,
      adyacencia: partida.adyacencia,
      jugadores: partida.jugadores,
      galaxiaNombre: partida.galaxiaNombre
    };
  }
}

// Exportar una sola instancia compartida por todo el servidor
module.exports = new GameManager();