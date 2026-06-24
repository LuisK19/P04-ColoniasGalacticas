import { Mountain, Zap, Gem, Clock, Target } from 'lucide-react';
import styles from './ResourceBar.module.css';

/*
 * Barra superior que muestra los recursos del jugador, el tiempo restante
 * de la partida, el progreso de victoria y el boton de salir.
 * Entrada: minerales - cantidad de minerales del jugador
 * Entrada: energia - cantidad de energia del jugador
 * Entrada: cristales - cantidad de cristales del jugador
 * Entrada: nickname - nombre del jugador actual
 * Entrada: tiempoRestanteSeg - segundos restantes de la partida (o null)
 * Entrada: sistemasJugador - cantidad de sistemas que controla el jugador
 * Entrada: totalSistemas - cantidad total de sistemas en la galaxia
 * Entrada: porcentajeVictoria - porcentaje necesario para ganar (ej: 70)
 * Entrada: onSalir - funcion a ejecutar al presionar el boton Salir (opcional)
 */
function ResourceBar({
  minerales = 0,
  energia = 0,
  cristales = 0,
  nickname = '',
  tiempoRestanteSeg = null,
  sistemasJugador = 0,
  totalSistemas = 0,
  porcentajeVictoria = 70,
  onSalir = null
}) {

  /*
   * Convierte segundos en formato MM:SS.
   * Entrada: seg - segundos totales
   * Salida: string con formato MM:SS
   */
  const formatearTiempo = (seg) => {
    if (seg == null || seg < 0) return '--:--';
    const m = Math.floor(seg / 60).toString().padStart(2, '0');
    const s = (seg % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Porcentaje actual del jugador sobre el total de sistemas
  const porcentajeActual = totalSistemas > 0
    ? Math.round((sistemasJugador / totalSistemas) * 100)
    : 0;

  // Ancho de la barra de progreso limitado a 100%
  const anchoBarra = Math.min(porcentajeActual, 100);

  // La barra se vuelve color acento cuando se esta cerca de ganar
  const cercaDeGanar = porcentajeActual >= porcentajeVictoria * 0.8;

  // El tiempo se muestra en rojo cuando quedan menos de 2 minutos
  const tiempoUrgente = tiempoRestanteSeg != null && tiempoRestanteSeg <= 120;

  return (
    <div className={styles.barra}>

      <div className={styles.jugador}>
        <div className={styles.avatar}>{nickname[0]?.toUpperCase()}</div>
        <span className={styles.nickname}>{nickname}</span>
      </div>

      <div className={styles.recursos}>
        <div className={styles.recurso}>
          <Mountain size={14} className={styles.iconoMineral} />
          <span className={styles.valor}>{minerales.toLocaleString()}</span>
          <span className={styles.etiqueta}>Minerales</span>
        </div>

        <div className={styles.separador} />

        <div className={styles.recurso}>
          <Zap size={14} className={styles.iconoEnergia} />
          <span className={styles.valor}>{energia.toLocaleString()}</span>
          <span className={styles.etiqueta}>Energia</span>
        </div>

        <div className={styles.separador} />

        <div className={styles.recurso}>
          <Gem size={14} className={styles.iconoCristal} />
          <span className={styles.valor}>{cristales.toLocaleString()}</span>
          <span className={styles.etiqueta}>Cristales</span>
        </div>
      </div>

      <div className={styles.indicadores}>

        {/* Barra de progreso de conquista */}
        <div className={styles.progreso}>
          <div className={styles.progresoInfo}>
            <Target size={13} className={styles.iconoProgreso} />
            <span className={styles.progresoTexto}>
              {sistemasJugador}/{totalSistemas} sistemas
            </span>
            <span className={`${styles.progresoPorc} ${cercaDeGanar ? styles.progresoCerca : ''}`}>
              {porcentajeActual}% / {porcentajeVictoria}%
            </span>
          </div>
          <div className={styles.barraProgreso}>
            <div
              className={`${styles.barraRelleno} ${cercaDeGanar ? styles.barraRelleno_cerca : ''}`}
              style={{ width: `${anchoBarra}%` }}
            />
            {/* Marcador vertical en el porcentaje de victoria */}
            <div
              className={styles.marcadorVictoria}
              style={{ left: `${porcentajeVictoria}%` }}
            />
          </div>
        </div>

        <div className={styles.separador} />

        {/* Tiempo restante */}
        <div className={styles.recurso}>
          <Clock size={14} className={tiempoUrgente ? styles.iconoTiempoUrgente : styles.iconoTiempo} />
          <span className={`${styles.valor} ${tiempoUrgente ? styles.valorUrgente : ''}`}>
            {formatearTiempo(tiempoRestanteSeg)}
          </span>
          <span className={styles.etiqueta}>Restante</span>
        </div>

      </div>

      {/* Boton salir al extremo derecho de la barra */}
      {onSalir && (
        <button className={styles.btnSalir} onClick={onSalir}>
          Salir
        </button>
      )}

    </div>
  );
}

export default ResourceBar;
