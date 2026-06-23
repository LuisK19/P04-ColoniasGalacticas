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

  // Refs para mantener valores actuales accesibles dentro del useEffect
  // de sockets sin que cambien sus dependencias y disparen reconexiones.
  const nicknameRef = useRef(nickname);
  const navigateRef = useRef(navigate);
  nicknameRef.current = nickname;
  navigateRef.current = navigate;

  /*
   * Muestra una notificación temporal en pantalla.
   * Entrada: mensaje - texto a mostrar
   * Entrada: tipo - exito | error
   */
  const mostrarNotificacion = useCallback((mensaje, tipo = 'exito') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  }, []);

  useEffect(() => {
    const guardado = localStorage.getItem('estadoJuego');
    if (guardado) {
      setEstadoJuego(JSON.parse(guardado));
    }
  }, []);

  // Conecta el socket y registra todos los eventos del juego.
  // Solo depende de gameId: no se desconecta ni reconecta por cambios
  // en nickname o en la referencia de funciones como navigate.
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
   * Envía al servidor la orden de construir una instalación.
   * Entrada: sistemaId - id del sistema donde construir
   * Entrada: tipo - mina | central | astillero | fortaleza
   */
  const handleConstruir = useCallback((sistemaId, tipo) => {
    socket.emit('game:build', { partidaId: gameId, nickname, sistemaId, tipo });
  }, [gameId, nickname]);

  /*
   * Activa el modo selección de destino para mover flotas desde
   * el sistema dado. El próximo clic en el mapa se interpreta como destino.
   * Entrada: sistemaId - sistema origen
   * Entrada: cantidad - cantidad de flotas a mover
   */
  const handleMoverFlotas = useCallback((sistemaId, cantidad) => {
    setFlotaPendiente({ origenId: sistemaId, cantidad });
    setSistemaSeleccionado(null);
    mostrarNotificacion('Seleccioná el sistema destino en el mapa', 'exito');
  }, [mostrarNotificacion]);

  /*
   * Cancela el modo selección de destino para mover flotas.
   */
  const handleCancelarFlota = useCallback(() => {
    setFlotaPendiente(null);
  }, []);

  /*
   * Abandona la partida voluntariamente. El jugador se marca como
   * eliminado en el backend (pierde sus sistemas) y se le regresa al inicio.
   */
  const handleSalir = useCallback(() => {
    const confirmado = window.confirm('¿Seguro que querés abandonar la partida? Perderás todos tus sistemas.');
    if (!confirmado) return;

    socket.emit('game:leave', { partidaId: gameId, nickname });
    socket.disconnect();
    navigate('/');
  }, [gameId, nickname, navigate]);

  /*
   * Maneja el clic en un sistema del mapa. Si hay una orden de mover
   * flotas pendiente, completa el movimiento hacia el sistema clickeado.
   * Si no, simplemente selecciona el sistema para ver su información.
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

  const adyacenciaEstable = useMemo(
    () => estadoJuego?.adyacencia,
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

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <ResourceBar
          minerales={jugadorActual.minerales ?? 0}
          energia={jugadorActual.energia ?? 0}
          cristales={jugadorActual.cristales ?? 0}
          nickname={nickname}
        />
        <button className={styles.btnSalir} onClick={handleSalir}>
          Salir
        </button>
      </div>

      {notificacion && (
        <div className={`${styles.notificacion} ${styles['notificacion' + (notificacion.tipo === 'error' ? 'Error' : 'Exito')]}`}>
          {notificacion.mensaje}
        </div>
      )}

      {flotaPendiente && (
        <div className={styles.avisoFlota}>
          Elegí el sistema destino en el mapa para enviar {flotaPendiente.cantidad} flotas.
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