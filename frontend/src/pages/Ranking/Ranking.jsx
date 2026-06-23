import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Globe, Clock, ChevronLeft, Medal } from 'lucide-react';
import axios from 'axios';
import styles from './Ranking.module.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/*
 * Pantalla de ranking histórico de partidas.
 * Muestra los ganadores de cada partida ordenados por fecha descendente.
 * Los datos se obtienen del endpoint GET /ranking, respaldado por la tabla
 * ranking en la base de datos.
 */
function Ranking() {
  const navigate = useNavigate();

  const [ranking, setRanking]   = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    axios.get(`${BACKEND}/ranking`)
      .then(res => setRanking(res.data.ranking))
      .catch(() => setError('No se pudo cargar el ranking'))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.panel}>

        <div className={styles.header}>
          <button className={styles.btnVolver} onClick={() => navigate('/')}>
            <ChevronLeft size={16} />
            Volver
          </button>
          <div className={styles.headerTitulo}>
            <Trophy size={24} className={styles.trofeo} />
            <h2 className={styles.titulo}>Ranking Global</h2>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {cargando ? (
          <p className={styles.info}>Cargando ranking...</p>
        ) : ranking.length === 0 ? (
          <div className={styles.vacio}>
            <p>No hay partidas registradas todavía.</p>
          </div>
        ) : (
          <div className={styles.lista}>
            {ranking.map((entrada, index) => (
              <div key={entrada.id} className={styles.card}>

                <div className={styles.cardPosicion}>
                  {index === 0 ? <Medal size={20} className={styles.oro} /> :
                   index === 1 ? <Medal size={20} className={styles.plata} /> :
                   index === 2 ? <Medal size={20} className={styles.bronce} /> :
                   <span className={styles.numero}>{index + 1}</span>}
                </div>

                <div className={styles.cardInfo}>
                  <div className={styles.cardNombre}>
                    {entrada.ganadorNickname}
                  </div>
                  <div className={styles.cardDetalles}>
                    <span className={styles.detalle}>
                      <Globe size={12} />
                      {entrada.galaxia}
                    </span>
                    <span className={styles.detalle}>
                      <Clock size={12} />
                      {entrada.tiempoJuego}
                    </span>
                    <span className={styles.detalle}>
                      {new Date(entrada.fechaPartida).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className={styles.cardStats}>
                  <div className={styles.stat}>
                    <span className={styles.statValor}>{entrada.sistemasControlados}</span>
                    <span className={styles.statEtiqueta}>Sistemas</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValor}>{entrada.minerales.toLocaleString()}</span>
                    <span className={styles.statEtiqueta}>Minerales</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValor}>{entrada.energia.toLocaleString()}</span>
                    <span className={styles.statEtiqueta}>Energía</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValor}>{entrada.cristales.toLocaleString()}</span>
                    <span className={styles.statEtiqueta}>Cristales</span>
                  </div>
                </div>

                <div className={styles.cardId}>
                  ID: {entrada.id.slice(0, 8)}...
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Ranking;