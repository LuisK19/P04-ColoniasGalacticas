import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, Clock, Globe, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { socket } from '../../socket/socket';
import styles from './Partidas.module.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/*
 * Pantalla que lista todas las partidas disponibles para unirse.
 * Se actualiza en tiempo real via WebSocket cuando alguien crea
 * o se une a una partida.
 */
function Partidas() {
  const navigate = useNavigate();
  const nickname = localStorage.getItem('nickname');

  const [partidas, setPartidas]   = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState('');
  const [uniendose, setUniendose] = useState(null);

  useEffect(() => {
    if (!nickname) navigate('/');
  }, []);

  // Cargar partidas al montar
  useEffect(() => {
    cargarPartidas();

    // Escuchar actualizaciones en tiempo real
    socket.connect();
    socket.on('lobby:update', () => cargarPartidas());

    return () => {
      socket.off('lobby:update');
      socket.disconnect();
    };
  }, []);

  /*
   * Obtiene la lista de partidas disponibles desde el backend.
   */
  const cargarPartidas = async () => {
    try {
      const res = await axios.get(`${BACKEND}/games`);
      setPartidas(res.data.partidas.filter(p => p.estado === 'esperando'));
    } catch {
      setError('Error al cargar las partidas');
    } finally {
      setCargando(false);
    }
  };

  /*
   * Une al jugador a la partida seleccionada y lo lleva al lobby.
   * Entrada: partidaId - id de la partida a unirse
   */
  const handleUnirse = async (partidaId) => {
    setUniendose(partidaId);
    setError('');

    try {
      await axios.post(`${BACKEND}/games/${partidaId}/join`, { nickname });
      navigate(`/lobby/${partidaId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo unir a la partida');
      setUniendose(null);
    }
  };

  const nivelColor = {
    bajo:   styles.nivelBajo,
    normal: styles.nivelNormal,
    alto:   styles.nivelAlto
  };

  return (
    <div className={styles.container}>
      <div className={styles.panel}>

        <div className={styles.header}>
          <button className={styles.btnVolver} onClick={() => navigate('/')}>
            <ChevronLeft size={16} />
            Volver
          </button>
          <h2 className={styles.titulo}>Partidas Disponibles</h2>
          <button className={styles.btnRefresh} onClick={cargarPartidas}>
            <RefreshCw size={15} />
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {cargando ? (
          <p className={styles.info}>Cargando partidas...</p>
        ) : partidas.length === 0 ? (
          <div className={styles.vacio}>
            <p>No hay partidas disponibles.</p>
            <p className={styles.infoMuted}>Creá una nueva para empezar.</p>
          </div>
        ) : (
          <div className={styles.lista}>
            {partidas.map(p => (
              <div key={p.id} className={styles.card}>
                <div className={styles.cardInfo}>

                  <div className={styles.cardNombre}>
                    {p.nombre}
                    <span className={`${styles.nivel} ${nivelColor[p.nivelRecursos]}`}>
                      {p.nivelRecursos}
                    </span>
                  </div>

                  <div className={styles.cardDetalles}>
                    <span className={styles.detalle}>
                      <Globe size={13} />
                      {p.galaxiaNombre}
                    </span>
                    <span className={styles.detalle}>
                      <Users size={13} />
                      {p.cantidadJugadores} / {p.maxJugadores}
                    </span>
                    <span className={styles.detalle}>
                      <Clock size={13} />
                      {p.tiempoMaximo} min
                    </span>
                  </div>

                  <div className={styles.cardId}>
                    ID: {p.id.slice(0, 8)}...
                  </div>

                </div>

                <button
                  className={styles.btnUnirse}
                  onClick={() => handleUnirse(p.id)}
                  disabled={uniendose === p.id || p.cantidadJugadores >= p.maxJugadores}
                >
                  {uniendose === p.id ? 'Uniéndose...' :
                   p.cantidadJugadores >= p.maxJugadores ? 'Llena' : 'Unirse'}
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Partidas;