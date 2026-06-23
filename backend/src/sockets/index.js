const gameManager = require('../game/GameManager');

/*
 * Inicializa todos los eventos de WebSocket del servidor.
 * Entrada: io - Instancia de Socket.IO
 */
module.exports = (io) => {

  io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    /*
     * El cliente se une a la sala de espera de una partida.
     * Evento: 'join-lobby'
     * Entrada: { partidaId, nickname }
     */
    socket.on('join-lobby', ({ partidaId, nickname }) => {
      socket.join(partidaId);
      socket.data.partidaId = partidaId;
      socket.data.nickname = nickname;

      console.log(`${nickname} entró al lobby de ${partidaId}`);

      io.to(partidaId).emit('lobby:update', {
        partida: gameManager.obtenerPartida(partidaId)
      });
    });

    /*
     * El host solicita iniciar la partida presionando la tecla U.
     * Solo el jugador que creó la partida puede disparar este evento.
     * Evento: 'game:request-start'
     * Entrada: { partidaId, nickname }
     */
    socket.on('game:request-start', ({ partidaId, nickname }) => {
      const partida = gameManager.obtenerPartida(partidaId);

      if (!partida) {
        socket.emit('error', { mensaje: 'Partida no encontrada' });
        return;
      }

      if (partida.host !== nickname) {
        socket.emit('error', { mensaje: 'Solo el host puede iniciar la partida' });
        return;
      }

      let cuenta = 3;
      io.to(partidaId).emit('game:countdown', { valor: cuenta });

      const intervalo = setInterval(() => {
        cuenta--;
        if (cuenta > 0) {
          io.to(partidaId).emit('game:countdown', { valor: cuenta });
        } else {
          clearInterval(intervalo);

          const resultado = gameManager.iniciarPartida(
            partidaId,
            (estadoJuego) => {
              io.to(partidaId).emit('game:tick', estadoJuego);
            },
            ({ partida: partidaFinal, ranking, motivo }) => {
              io.to(partidaId).emit('game:end', { partida: partidaFinal, ranking, motivo });
            }
          );

          if (!resultado.ok) {
            io.to(partidaId).emit('error', { mensaje: resultado.error });
            return;
          }

          io.to(partidaId).emit('game:start', resultado.partida);
        }
      }, 1000);
    });

    /*
     * Un jugador construye una instalación en un sistema que controla.
     * Evento: 'game:build'
     * Entrada: { partidaId, nickname, sistemaId, tipo }
     * tipo puede ser: mina | central | astillero | fortaleza
     */
    socket.on('game:build', ({ partidaId, nickname, sistemaId, tipo }) => {
      const resultado = gameManager.construir(partidaId, nickname, sistemaId, tipo);

      if (!resultado.ok) {
        socket.emit('error', { mensaje: resultado.error });
        return;
      }

      io.to(partidaId).emit('system:updated', {
        sistema: resultado.sistema,
        jugador: resultado.jugador,
        accion: 'construccion',
        tipo
      });
    });

    /*
     * Un jugador mueve flotas de un sistema a otro.
     * Si el destino pertenece a otro jugador se resuelve un combate.
     * Evento: 'game:move-fleet'
     * Entrada: { partidaId, nickname, origenId, destinoId, cantidad }
     */
    socket.on('game:move-fleet', ({ partidaId, nickname, origenId, destinoId, cantidad }) => {
      const resultado = gameManager.moverFlotas(partidaId, nickname, origenId, destinoId, cantidad);

      if (!resultado.ok) {
        socket.emit('error', { mensaje: resultado.error });
        return;
      }

      if (resultado.combate) {
        io.to(partidaId).emit('combat:resolved', {
          resultado: resultado.resultado,
          origen: resultado.origen,
          destino: resultado.destino
        });

        const defensor = resultado.resultado.defensor;
        const partidaCompleta = gameManager.partidas[partidaId];
        if (partidaCompleta?.jugadores[defensor]?.eliminado) {
          io.to(partidaId).emit('player:eliminated', { nickname: defensor });
        }
      } else {
        io.to(partidaId).emit('fleet:moved', {
          origen: resultado.origen,
          destino: resultado.destino,
          nickname
        });
      }
    });

    /*
    * Un jugador abandona la partida voluntariamente.
    * Se marca como eliminado, igual que si hubiera perdido todos sus sistemas.
    * Evento: 'game:leave'
    * Entrada: { partidaId, nickname }
    */
    socket.on('game:leave', ({ partidaId, nickname }) => {
      const resultado = gameManager.salirDeJuego(partidaId, nickname);

      if (!resultado.ok) {
        socket.emit('error', { mensaje: resultado.error });
        return;
      }

      io.to(partidaId).emit('player:eliminated', { nickname });

      if (resultado.partidaFinalizada) {
        io.to(partidaId).emit('game:end', resultado.resultadoFinal);
      }
    });

    /*
     * Maneja la desconexión de un cliente.
     * Notifica al resto del lobby si estaba en una partida.
     */
    socket.on('disconnect', () => {
      const { partidaId, nickname } = socket.data;
      console.log(`Cliente desconectado: ${nickname || socket.id}`);

      if (partidaId && nickname) {
        io.to(partidaId).emit('lobby:update', {
          partida: gameManager.obtenerPartida(partidaId)
        });
      }
    });
  });
};