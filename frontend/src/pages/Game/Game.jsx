import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { socket } from '../../socket/socket';
import GalaxyMap from '../../components/GalaxyMap/GalaxyMap';
import ResourceBar from '../../components/ResourceBar/ResourceBar';
import SystemPanel from '../../components/SystemPanel/SystemPanel';
import styles from './Game.module.css';

/*
 * Pantalla principal del juego.
 * Recibe el estado inicial por localStorage (guardado por Lobby.jsx al
 * recibir game:start) y se mantiene sincronizada en tiempo real mediante
 * los eventos de WebSocket emitidos por el backend.
 */
function Game() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const nickname = localStorage.getItem('nickname') || 'usuario';

  const [estadoJuego, setEstadoJuego] = useState(null);
  const [sistemaSeleccionado, setSistemaSeleccionado] = useState(null);
  const [flotaPendiente, setFlotaPendiente] = useState(null);
  const [notificacion, setNotificacion] = useState(null);

  // Segundos restantes de la partida, calculados localmente con un intervalo
  const [tiempoRestanteSeg, setTiempoRestanteSeg] = useState(null);

  // Refs para mantener valores actuales accesibles dentro del useEffect
  // de sockets sin que cambien sus dependencias y disparen reconexiones.
  const nicknameRef = useRef(nickname);
  const navigateRef = useRef(navigate);
  nicknameRef.current = nickname;
  navigateRef.current = navigate;

  /*
   * Muestra una notificacion temporal en pantalla.
   * Entrada: mensaje - texto a mostrar
   * Entrada: tipo - exito | error
   */
  const mostrarNotificacion = useCallback((mensaje, tipo = 'exito') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  }, []);

  // Carga el estado inicial guardado por el Lobby al navegar a esta pantalla
  useEffect(() => {
    const guardado = localStorage.getItem('estadoJuego');
    if (guardado) {
      const estado = JSON.parse(guardado);
      setEstadoJuego(estado);

      // Inicializar el tiempo restante si el backend lo envia
      if (estado.tiempoMaximoSeg) {
        setTiempoRestanteSeg(estado.tiempoMaximoSeg);
      }
    }
  }, []);

  /*
   * Contador regresivo del tiempo de partida.
   * Descuenta un segundo por intervalo mientras quede tiempo.
   * Se detiene al llegar a cero (el backend emite game:end en ese momento).
   */
  useEffect(() => {
    if (tiempoRestanteSeg == null) return;

    const intervalo = setInterval(() => {
      setTiempoRestanteSeg(prev => {
        if (prev <= 1) {
          clearInterval(intervalo);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [tiempoRestanteSeg == null]); // eslint-disable-line react-hooks/exhaustive-deps

  // Conecta el socket y registra todos los eventos del juego.
  // Solo depende de gameId para no disparar reconexiones innecesarias.
  useEffect(() => {
    socket.connect();
    socket.emit('join-lobby', { partidaId: gameId, nickname: nicknameRef.current });

    socket.on('game:tick', (nuevoEstado) => {
      setEstadoJuego(nuevoEstado);
    });

    socket.on('system:updated', ({ sistema, accion, tipo }) => {
      setEstadoJuego(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          sistemas: { ...prev.sistemas, [sistema.id]: sistema }
        };
      });
      if (accion === 'construccion') {
        mostrarNotificacion(`${tipo} construido en ${sistema.nombre}`, 'exito');
      }
    });

    socket.on('fleet:moved', ({ origen, destino }) => {
      setEstadoJuego(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          sistemas: {
            ...prev.sistemas,
            [origen.id]: origen,
            [destino.id]: destino
          }
        };
      });
      mostrarNotificacion(`Flotas movidas a ${destino.nombre}`, 'exito');
    });

    socket.on('combat:resolved', ({ resultado, origen, destino }) => {
      setEstadoJuego(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          sistemas: {
            ...prev.sistemas,
            [origen.id]: origen,
            [destino.id]: destino
          }
        };
      });
      const gano = resultado.ganador === nicknameRef.current;
      mostrarNotificacion(
        gano ? `Conquistaste ${destino.nombre}` : `Perdiste el combate por ${destino.nombre}`,
        gano ? 'exito' : 'error'
      );
    });

    socket.on('player:eliminated', ({ nickname: eliminado }) => {
      setEstadoJuego(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          jugadores: {
            ...prev.jugadores,
            [eliminado]: { ...prev.jugadores[eliminado], eliminado: true }
          }
        };
      });
      mostrarNotificacion(`${eliminado} fue eliminado de la partida`, 'error');
    });

    socket.on('game:end', (resultado) => {
      localStorage.setItem('resultadoPartida', JSON.stringify(resultado));
      navigateRef.current(`/results/${gameId}`);
    });

    socket.on('error', ({ mensaje }) => {
      mostrarNotificacion(mensaje, 'error');
    });

    return () => {
      socket.off('game:tick');
      socket.off('system:updated');
      socket.off('fleet:moved');
      socket.off('combat:resolved');
      socket.off('player:eliminated');
      socket.off('game:end');
      socket.off('error');
      socket.disconnect();
    };
  }, [gameId, mostrarNotificacion]);

  const handleClickSistema = useCallback((sistema) => {
    setSistemaSeleccionado(sistema);
  }, []);

  const handleCerrarPanel = useCallback(() => {
    setSistemaSeleccionado(null);
  }, []);

  /*
   * Envia al servidor la orden de construir una instalacion.
   * Entrada: sistemaId - id del sistema donde construir
   * Entrada: tipo - mina | central | astillero | fortaleza
   */
  const handleConstruir = useCallback((sistemaId, tipo) => {
    socket.emit('game:build', { partidaId: gameId, nickname, sistemaId, tipo });
  }, [gameId, nickname]);

  /*
   * Activa el modo seleccion de destino para mover flotas desde
   * el sistema dado. El proximo clic en el mapa se interpreta como destino.
   * Entrada: sistemaId - sistema origen
   * Entrada: cantidad - cantidad de flotas a mover
   */
  const handleMoverFlotas = useCallback((sistemaId, cantidad) => {
    setFlotaPendiente({ origenId: sistemaId, cantidad });
    setSistemaSeleccionado(null);
    mostrarNotificacion('Selecciona el sistema destino en el mapa', 'exito');
  }, [mostrarNotificacion]);

  /*
   * Cancela el modo seleccion de destino para mover flotas.
   */
  const handleCancelarFlota = useCallback(() => {
    setFlotaPendiente(null);
  }, []);

  /*
   * Abandona la partida voluntariamente. El jugador se marca como
   * eliminado en el backend y se le regresa al inicio.
   */
  const handleSalir = useCallback(() => {
    const confirmado = window.confirm('Seguro que queres abandonar la partida? Perderas todos tus sistemas.');
    if (!confirmado) return;

    socket.emit('game:leave', { partidaId: gameId, nickname });
    socket.disconnect();
    navigate('/');
  }, [gameId, nickname, navigate]);

  /*
   * Maneja el clic en un sistema del mapa. Si hay una orden de mover
   * flotas pendiente, completa el movimiento hacia el sistema clickeado.
   * Si no, simplemente selecciona el sistema para ver su informacion.
   */
  const handleClickMapa = useCallback((sistema) => {
    if (flotaPendiente) {
      if (sistema.id === flotaPendiente.origenId) {
        setFlotaPendiente(null);
        return;
      }
      socket.emit('game:move-fleet', {
        partidaId: gameId,
        nickname,
        origenId: flotaPendiente.origenId,
        destinoId: sistema.id,
        cantidad: flotaPendiente.cantidad
      });
      setFlotaPendiente(null);
      return;
    }
    handleClickSistema(sistema);
  }, [flotaPendiente, gameId, nickname, handleClickSistema]);

  // Estabiliza la adyacencia para que GalaxyMap no redibuje el grafo
  // en cada tick aunque la estructura no haya cambiado realmente.
  const adyacenciaEstable = useMemo(
    () => estadoJuego?.adyacencia,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(estadoJuego?.adyacencia)]
  );

  if (!estadoJuego) {
    return (
      <div className={styles.container}>
        <p className={styles.info}>Cargando partida...</p>
      </div>
    );
  }

  const jugadorActual = estadoJuego.jugadores?.[nickname] || {};
  const totalSistemas = Object.keys(estadoJuego.sistemas || {}).length;

  // Cantidad de sistemas que controla el jugador actual
  const sistemasJugador = Object.values(estadoJuego.sistemas || {})
    .filter(s => s.propietario === nickname).length;

  return (
    <div className={styles.container}>

      <ResourceBar
        minerales={jugadorActual.minerales ?? 0}
        energia={jugadorActual.energia ?? 0}
        cristales={jugadorActual.cristales ?? 0}
        nickname={nickname}
        tiempoRestanteSeg={tiempoRestanteSeg}
        sistemasJugador={sistemasJugador}
        totalSistemas={totalSistemas}
        porcentajeVictoria={estadoJuego.porcentajeVictoria ?? 70}
        onSalir={handleSalir}
      />

      {notificacion && (
        <div className={`${styles.notificacion} ${styles['notificacion' + (notificacion.tipo === 'error' ? 'Error' : 'Exito')]}`}>
          {notificacion.mensaje}
        </div>
      )}

      {flotaPendiente && (
        <div className={styles.avisoFlota}>
          Elegi el sistema destino en el mapa para enviar {flotaPendiente.cantidad} flotas.
          <button className={styles.btnCancelarFlota} onClick={handleCancelarFlota}>
            Cancelar
          </button>
        </div>
      )}

      <div className={styles.contenido}>
        <div className={styles.mapa}>
          <GalaxyMap
            sistemas={estadoJuego.sistemas}
            adyacencia={adyacenciaEstable}
            onClickSistema={handleClickMapa}
            nickname={nickname}
            origenFlota={flotaPendiente?.origenId || null}
          />
        </div>
        {sistemaSeleccionado && !flotaPendiente && (
          <SystemPanel
            sistema={estadoJuego.sistemas[sistemaSeleccionado.id] || sistemaSeleccionado}
            onCerrar={handleCerrarPanel}
            nickname={nickname}
            onConstruir={handleConstruir}
            onMoverFlotas={handleMoverFlotas}
          />
        )}
      </div>

    </div>
  );
}

export default Game;
