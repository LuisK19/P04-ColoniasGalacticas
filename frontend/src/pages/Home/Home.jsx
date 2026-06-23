import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Users, Trophy } from 'lucide-react';
import axios from 'axios';
import styles from './Home.module.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/*
 * Pantalla principal del juego.
 * Permite al jugador ingresar su nickname y elegir entre
 * crear partida, unirse a una partida o ver el ranking.
 */
function Home() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState(localStorage.getItem('nickname') || '');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  /*
   * Valida el nickname y lo guarda en localStorage.
   * Entrada: accion - string que indica a dónde navegar después
   */
  const handleAccion = async (accion) => {
    if (!nickname.trim()) {
      setError('Ingresá tu nickname para continuar');
      return;
    }
    if (nickname.trim().length < 3) {
      setError('El nickname debe tener al menos 3 caracteres');
      return;
    }

    setCargando(true);
    setError('');

    try {
      const res = await axios.post(`${BACKEND}/auth`, { nickname: nickname.trim() });
      localStorage.setItem('nickname', res.data.nickname);
      localStorage.setItem('token', res.data.token);

      if (accion === 'crear') navigate('/crear');
      if (accion === 'unirse') navigate('/partidas');
      if (accion === 'ranking') navigate('/ranking');
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.titulo}>Colonias Galácticas</h1>
        <p className={styles.subtitulo}>Conquistá la galaxia, expandí tu imperio</p>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Nickname</label>
          <input
            className={styles.input}
            type="text"
            placeholder="Tu nombre en la galaxia..."
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAccion('unirse')}
            maxLength={20}
          />
          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.botones}>
          <button
            className={`${styles.boton} ${styles.botonPrimario}`}
            onClick={() => handleAccion('crear')}
            disabled={cargando}
          >
            <Rocket size={18} />
            Crear Partida
          </button>

          <button
            className={`${styles.boton} ${styles.botonSecundario}`}
            onClick={() => handleAccion('unirse')}
            disabled={cargando}
          >
            <Users size={18} />
            Unirse a Partida
          </button>

          <button
            className={`${styles.boton} ${styles.botonTerciario}`}
            onClick={() => handleAccion('ranking')}
            disabled={cargando}
          >
            <Trophy size={18} />
            Ver Ranking
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;