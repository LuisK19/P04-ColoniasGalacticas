import { useNavigate, useParams } from 'react-router-dom';
import { Trophy, Globe, Clock, Users, Medal } from 'lucide-react';
import styles from './Results.module.css';

/*
 * Pantalla de resultados al finalizar una partida.
 * Lee el resultado guardado en localStorage por Game.jsx cuando
 * llega el evento game:end del WebSocket.
 */
function Results() {
  const navigate   = useNavigate();
  const { gameId } = useParams();

  const dataGuardada = localStorage.getItem('resultadoPartida');
  const resultadoCrudo = dataGuardada ? JSON.parse(dataGuardada) : null;

  if (!resultadoCrudo) {
    return (
      <div className={styles.container}>
        <div className={styles.panel}>
          <p className={styles.info}>No hay resultados disponibles para esta partida.</p>
          <div className={styles.acciones}>
            <button className={styles.btnInicio} onClick={() => navigate('/')}>
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { partida, ranking } = resultadoCrudo;

  const tiempoJuegoSeg = partida.iniciadaEn
    ? Math.floor((Date.now() - partida.iniciadaEn) / 1000)
    : 0;

  const formatearTiempo = (segundos) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${seg.toString().padStart(2, '0')}`;
  };

  const ganador = ranking[0];

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
            {partida.galaxiaNombre}
          </div>
          <div className={styles.infoItem}>
            <Clock size={14} />
            {formatearTiempo(tiempoJuegoSeg)} de juego
          </div>
          <div className={styles.infoItem}>
            <Users size={14} />
            {ranking.length} jugadores
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

          {ranking.map(j => (
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
              <span>{j.centrales}</span>
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