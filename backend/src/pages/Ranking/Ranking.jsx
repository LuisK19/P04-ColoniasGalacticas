import { useNavigate } from 'react-router-dom';
import { Trophy, Globe, Clock, ChevronLeft, Medal } from 'lucide-react';
import styles from './Ranking.module.css';

/*
 * Pantalla de ranking histórico de partidas.
 * Muestra los ganadores de cada partida ordenados por fecha.
 * Entrada: ninguna — los datos se cargan desde la BD al conectar la API.
 */
function Ranking() {
  const navigate = useNavigate();

  const ranking = [
    {
      id:                  'abc-123',
      ganadorNickname:     'Luis',
      sistemasControlados: 18,
      minerales:           2400,
      energia:             1800,
      cristales:           600,
      galaxia:             'Nebulosa Orion',
      tiempoJuego:         '23:15',
      fechaPartida:        '2026-06-14'
    },
    {
      id:                  'def-456',
      ganadorNickname:     'Rival',
      sistemasControlados: 15,
      minerales:           1800,
      energia:             900,
      cristales:           300,
      galaxia:             'Nebulosa Orion',
      tiempoJuego:         '18:42',
      fechaPartida:        '2026-06-13'
    },
    {
      id:                  'ghi-789',
      ganadorNickname:     'Jugador3',
      sistemasControlados: 20,
      minerales:           3000,
      energia:             2200,
      cristales:           800,
      galaxia:             'Nebulosa Orion',
      tiempoJuego:         '30:00',
      fechaPartida:        '2026-06-12'
    }
  ];

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

        {ranking.length === 0 ? (
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
                      {entrada.fechaPartida}
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
                  ID: {entrada.id}
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