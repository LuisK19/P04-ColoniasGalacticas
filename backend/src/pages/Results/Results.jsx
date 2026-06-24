import { useNavigate, useParams } from 'react-router-dom';
import { Trophy, Globe, Clock, Users, Medal } from 'lucide-react';
import styles from './Results.module.css';

function Results() {
  const navigate   = useNavigate();
  const { gameId } = useParams();

  const resultados = {
    tiempoJuego:  '12:34',
    galaxia:      'Nebulosa Orion',
    partidaId:    gameId || 'demo-123',
    jugadores: [
      {
        posicion:            1,
        nickname:            'Luis',
        puntaje:             42500,
        sistemasControlados: 8,
        minerales:           1200,
        energia:             800,
        cristales:           300,
        flotas:              15,
        minas:               4,
        centros:             2,
        fortalezas:          1,
        eliminado:           false
      },
      {
        posicion:            2,
        nickname:            'Rival',
        puntaje:             28000,
        sistemasControlados: 5,
        minerales:           600,
        energia:             400,
        cristales:           150,
        flotas:              8,
        minas:               2,
        centros:             1,
        fortalezas:          0,
        eliminado:           false
      },
      {
        posicion:            3,
        nickname:            'Jugador3',
        puntaje:             5000,
        sistemasControlados: 1,
        minerales:           100,
        energia:             50,
        cristales:           20,
        flotas:              0,
        minas:               0,
        centros:             0,
        fortalezas:          0,
        eliminado:           true
      }, 
      {
        posicion:            4,
        nickname:            'Jugador4',
        puntaje:             3000,
        sistemasControlados: 0,
        minerales:           50,
        energia:             20,
        cristales:           10,
        flotas:              0,
        minas:               0,
        centros:             0,
        fortalezas:          0,
        eliminado:           true
      }
    ]
  };

  const ganador = resultados.jugadores[0];

  /*
   * Devuelve el icono de medalla según la posición del jugador.
   * Entrada: posicion - número de posición del jugador
   */
  const iconoPosicion = (posicion) => {
    if (posicion === 1) return <Medal size={16} className={styles.oro} />;
    if (posicion === 2) return <Medal size={16} className={styles.plata} />;
    if (posicion === 3) return <Medal size={16} className={styles.bronce} />;
    return <span>{posicion}</span>;
  };

  return (
    <div className={styles.container}>
      <div className={styles.panel}>

        <div className={styles.header}>
          <Trophy size={32} className={styles.trofeo} />
          <h2 className={styles.titulo}>Resultados</h2>
          <p className={styles.ganador}>
            Ganador: <span>{ganador.nickname}</span>
          </p>
        </div>

        <div className={styles.infoPartida}>
          <div className={styles.infoItem}>
            <Globe size={14} />
            {resultados.galaxia}
          </div>
          <div className={styles.infoItem}>
            <Clock size={14} />
            {resultados.tiempoJuego} de juego
          </div>
          <div className={styles.infoItem}>
            <Users size={14} />
            {resultados.jugadores.length} jugadores
          </div>
        </div>

        <div className={styles.tabla}>
          <div className={styles.tablaHeader}>
            <span>#</span>
            <span>Jugador</span>
            <span>Puntaje</span>
            <span>Sistemas</span>
            <span>Minerales</span>
            <span>Energía</span>
            <span>Cristales</span>
            <span>Flotas</span>
            <span>Minas</span>
            <span>Centros</span>
            <span>Fortalezas</span>
          </div>

          {resultados.jugadores.map(j => (
            <div
              key={j.nickname}
              className={`${styles.fila} ${j.posicion === 1 ? styles.filaPrimera : ''} ${j.eliminado ? styles.filaEliminado : ''}`}
            >
              <span className={styles.posicion}>{iconoPosicion(j.posicion)}</span>
              <span className={styles.nombre}>{j.nickname}</span>
              <span className={styles.puntaje}>{j.puntaje.toLocaleString()}</span>
              <span>{j.sistemasControlados}</span>
              <span>{j.minerales.toLocaleString()}</span>
              <span>{j.energia.toLocaleString()}</span>
              <span>{j.cristales.toLocaleString()}</span>
              <span>{j.flotas}</span>
              <span>{j.minas}</span>
              <span>{j.centros}</span>
              <span>{j.fortalezas}</span>
            </div>
          ))}
        </div>

        <div className={styles.acciones}>
          <button
            className={styles.btnRanking}
            onClick={() => navigate('/ranking')}
          >
            Ver Ranking Global
          </button>
          <button
            className={styles.btnInicio}
            onClick={() => navigate('/')}
          >
            Volver al Inicio
          </button>
        </div>

      </div>
    </div>
  );
}

export default Results;