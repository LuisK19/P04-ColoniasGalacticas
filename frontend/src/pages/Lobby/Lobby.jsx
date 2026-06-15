import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, Clock, Globe, Crown, Rocket, ChevronLeft } from 'lucide-react';
import { socket } from '../../socket/socket';
import axios from 'axios';
import styles from './Lobby.module.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/*
 * Sala de espera de una partida.
 * Muestra los jugadores conectados en tiempo real.
 * El host puede iniciar la partida cuando haya suficientes jugadores.
 * Al presionar U (si eres host) se dispara el inicio con cuenta regresiva.
 */
function Lobby() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const nickname = localStorage.getItem('nickname');

    const [partida, setPartida] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(true);

    /*
     * Obtiene el estado actual de la partida desde el backend.
     */
    const cargarPartida = useCallback(async () => {
        try {
            const res = await axios.get(`${BACKEND}/games/${gameId}`);
            setPartida(res.data.partida);
        } catch {
            setError('No se pudo cargar la partida');
        } finally {
            setCargando(false);
        }
    }, [gameId]);

    /*
     * Solicita al servidor iniciar la partida.
     * Solo funciona si el jugador es el host.
     */
    const handleIniciar = useCallback(() => {
        setError('');
        socket.emit('game:request-start', { partidaId: gameId, nickname });
    }, [gameId, nickname]);

    useEffect(() => {
        if (!nickname) navigate('/');
    }, [nickname, navigate]);

    // Cargar partida al montar
    useEffect(() => {
        cargarPartida();
    }, [cargarPartida]);

    // Configurar socket y eventos
    useEffect(() => {
        socket.connect();
        socket.emit('join-lobby', { partidaId: gameId, nickname });

        socket.on('lobby:update', ({ partida }) => {
            setPartida(partida);
        });

        socket.on('game:countdown', ({ valor }) => {
            setCountdown(valor);
        });

        socket.on('game:start', (estadoJuego) => {
            localStorage.setItem('estadoJuego', JSON.stringify(estadoJuego));
            navigate(`/game/${gameId}`);
        });

        socket.on('error', ({ mensaje }) => {
            setError(mensaje);
        });

        const handleKeyDown = (e) => {
            if (e.key === 'u' || e.key === 'U') {
                handleIniciar();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            socket.off('lobby:update');
            socket.off('game:countdown');
            socket.off('game:start');
            socket.off('error');
            window.removeEventListener('keydown', handleKeyDown);
            socket.disconnect();
        };
    }, [gameId, nickname, navigate, handleIniciar]);

    /*
    * Sale de la partida y vuelve a la lista de partidas.
    * Notifica al backend para liberar el espacio del jugador.
    */
    const handleSalir = useCallback(async () => {
        try {
            await axios.post(`${BACKEND}/games/${gameId}/leave`, { nickname });
            socket.emit('join-lobby', { partidaId: gameId, nickname });
        } catch {
            // Si falla igual navegamos para atrás
        } finally {
            socket.disconnect();
            navigate('/partidas');
        }
    }, [gameId, nickname, navigate]);

    const esHost = partida?.host === nickname;
    const puedeIniciar = esHost &&
        partida?.cantidadJugadores >= partida?.minJugadores &&
        partida?.estado === 'esperando';

    if (cargando) {
        return (
            <div className={styles.container}>
                <p className={styles.info}>Cargando sala de espera...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>

            {countdown !== null && (
                <div className={styles.countdownOverlay}>
                    <div className={styles.countdownNumero}>{countdown}</div>
                    <p className={styles.countdownTexto}>La partida está por comenzar</p>
                </div>
            )}

            <div className={styles.panel}>

                <div className={styles.header}>
                    <button className={styles.btnVolver} onClick={handleSalir}>
                        <ChevronLeft size={16} />
                        Salir
                    </button>
                    <h2 className={styles.titulo}>{partida?.nombre}</h2>
                    <span className={styles.badge}>Sala de espera</span>
                </div>

                <div className={styles.detalles}>
                    <div className={styles.detalle}>
                        <Globe size={14} />
                        {partida?.galaxiaNombre}
                    </div>
                    <div className={styles.detalle}>
                        <Clock size={14} />
                        {partida?.tiempoMaximo} minutos
                    </div>
                    <div className={styles.detalle}>
                        <Users size={14} />
                        {partida?.cantidadJugadores} / {partida?.maxJugadores} jugadores
                    </div>
                </div>

                <div className={styles.seccion}>
                    <h3 className={styles.seccionTitulo}>Jugadores conectados</h3>
                    <div className={styles.jugadores}>
                        {partida?.jugadores?.map(j => (
                            <div key={j} className={styles.jugador}>
                                <div className={styles.jugadorAvatar}>
                                    {j[0].toUpperCase()}
                                </div>
                                <span className={styles.jugadorNombre}>{j}</span>
                                {j === partida.host && (
                                    <span className={styles.hostBadge}>
                                        <Crown size={12} />
                                        Host
                                    </span>
                                )}
                                {j === nickname && (
                                    <span className={styles.tuBadge}>Tú</span>
                                )}
                            </div>
                        ))}

                        {Array.from({ length: partida?.maxJugadores - (partida?.jugadores?.length || 0) }).map((_, i) => (
                            <div key={`vacio-${i}`} className={`${styles.jugador} ${styles.jugadorVacio}`}>
                                <div className={styles.jugadorAvatar}>?</div>
                                <span className={styles.jugadorNombre}>Esperando jugador...</span>
                            </div>
                        ))}
                    </div>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.acciones}>
                    {esHost ? (
                        <div className={styles.accionesHost}>
                            <button
                                className={styles.btnIniciar}
                                onClick={handleIniciar}
                                disabled={!puedeIniciar}
                            >
                                <Rocket size={18} />
                                Iniciar Partida
                            </button>
                            {puedeIniciar ? (
                                <p className={styles.infoMuted}>
                                    Presioná <code>U</code> o el botón para iniciar.
                                </p>
                            ) : (
                                <p className={styles.infoMuted}>
                                    Se necesitan al menos {partida?.minJugadores} jugadores para iniciar.
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className={styles.infoEspera}>
                            Esperando que el host inicie la partida...
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
}

export default Lobby;