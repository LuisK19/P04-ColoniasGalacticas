import { Mountain, Zap, Gem } from 'lucide-react';
import styles from './ResourceBar.module.css';

/*
 * Barra superior que muestra los recursos actuales del jugador.
 * Entrada: minerales - cantidad de minerales del jugador
 * Entrada: energia - cantidad de energía del jugador
 * Entrada: cristales - cantidad de cristales del jugador
 * Entrada: nickname - nombre del jugador
 */
function ResourceBar({ minerales = 0, energia = 0, cristales = 0, nickname = '' }) {
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
          <span className={styles.etiqueta}>Energía</span>
        </div>

        <div className={styles.separador} />

        <div className={styles.recurso}>
          <Gem size={14} className={styles.iconoCristal} />
          <span className={styles.valor}>{cristales.toLocaleString()}</span>
          <span className={styles.etiqueta}>Cristales</span>
        </div>
      </div>
    </div>
  );
}

export default ResourceBar;