import { useState } from 'react';
import GalaxyMap from '../../components/GalaxyMap/GalaxyMap';
import ResourceBar from '../../components/ResourceBar/ResourceBar';
import SystemPanel from '../../components/SystemPanel/SystemPanel';

import styles from './Game.module.css';


// Datos de prueba tomados del JSON de la galaxia
const SISTEMAS_PRUEBA = {
  S1: { id: 'S1', nombre: 'Terra', tipo: 'balanceado', propietario: 'Luis', estado: 'controlado', flotas: 3, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S2: { id: 'S2', nombre: 'Nova', tipo: 'minero', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S3: { id: 'S3', nombre: 'Atlas', tipo: 'energetico', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S4: { id: 'S4', nombre: 'Vega', tipo: 'cientifico', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S5: { id: 'S5', nombre: 'Helios', tipo: 'minero', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S6: { id: 'S6', nombre: 'Titan', tipo: 'energetico', propietario: 'Rival', estado: 'controlado', flotas: 5, instalaciones: { minas: 1, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S7: { id: 'S7', nombre: 'Draco', tipo: 'cientifico', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S8: { id: 'S8', nombre: 'Luna', tipo: 'balanceado', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S9: { id: 'S9', nombre: 'Ares', tipo: 'minero', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S10: { id: 'S10', nombre: 'Nexus', tipo: 'energetico', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S11: { id: 'S11', nombre: 'Argos', tipo: 'cientifico', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S12: { id: 'S12', nombre: 'Lyra', tipo: 'balanceado', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S13: { id: 'S13', nombre: 'Orion', tipo: 'minero', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S14: { id: 'S14', nombre: 'Phoenix', tipo: 'energetico', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S15: { id: 'S15', nombre: 'Hydra', tipo: 'cientifico', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S16: { id: 'S16', nombre: 'Zenith', tipo: 'balanceado', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S17: { id: 'S17', nombre: 'Gaia', tipo: 'minero', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S18: { id: 'S18', nombre: 'Erebus', tipo: 'energetico', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S19: { id: 'S19', nombre: 'Chronos', tipo: 'cientifico', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S20: { id: 'S20', nombre: 'Sigma', tipo: 'balanceado', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S21: { id: 'S21', nombre: 'Omega', tipo: 'minero', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S22: { id: 'S22', nombre: 'Aurora', tipo: 'energetico', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S23: { id: 'S23', nombre: 'Polaris', tipo: 'cientifico', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S24: { id: 'S24', nombre: 'Nebula', tipo: 'balanceado', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
  S25: { id: 'S25', nombre: 'Andromeda', tipo: 'minero', propietario: null, estado: 'no_explorado', flotas: 0, instalaciones: { minas: 0, centrales: 0, astilleros: 0, fortalezas: 0 } },
};

const ADYACENCIA_PRUEBA = {
  S1: ['S2', 'S25', 'S6'], S2: ['S1', 'S3', 'S7'],
  S3: ['S2', 'S4', 'S8'], S4: ['S3', 'S5', 'S9'],
  S5: ['S4', 'S6', 'S10'], S6: ['S5', 'S7', 'S11', 'S1'],
  S7: ['S6', 'S8', 'S12', 'S2'], S8: ['S7', 'S9', 'S13', 'S3'],
  S9: ['S8', 'S10', 'S14', 'S4'], S10: ['S9', 'S11', 'S15', 'S5'],
  S11: ['S10', 'S12', 'S16', 'S6'], S12: ['S11', 'S13', 'S17', 'S7'],
  S13: ['S12', 'S14', 'S18', 'S8'], S14: ['S13', 'S15', 'S19', 'S9'],
  S15: ['S14', 'S16', 'S20', 'S10'], S16: ['S15', 'S17', 'S21', 'S11'],
  S17: ['S16', 'S18', 'S12'], S18: ['S17', 'S19', 'S13'],
  S19: ['S18', 'S20', 'S14'], S20: ['S19', 'S21', 'S15'],
  S21: ['S20', 'S22', 'S16'], S22: ['S21', 'S23'],
  S23: ['S22', 'S24'], S24: ['S23', 'S25'],
  S25: ['S24', 'S1'],
};

/*
 * Pantalla principal del juego.
 * Muestra el mapa galáctico y permite interactuar con los sistemas.
 * Por ahora usa datos de prueba hasta conectar con el backend.
 */
function Game() {
  const nickname = localStorage.getItem('nickname') || 'Usuario';
  const [sistemaSeleccionado, setSistemaSeleccionado] = useState(null);

  return (
    <div className={styles.container}>
      <ResourceBar
        minerales={300}
        energia={150}
        cristales={50}
        nickname={nickname}
      />
      <div className={styles.contenido}>
        <div className={styles.mapa}>
          <GalaxyMap
            sistemas={SISTEMAS_PRUEBA}
            adyacencia={ADYACENCIA_PRUEBA}
            onClickSistema={setSistemaSeleccionado}
            nickname={nickname}
          />
        </div>

        {sistemaSeleccionado && (
          <SystemPanel
            sistema={sistemaSeleccionado}
            onCerrar={() => setSistemaSeleccionado(null)}
            nickname={nickname}
            onConstruir={(sistemaId, tipo) => console.log('construir', sistemaId, tipo)}
            onMoverFlotas={(sistemaId, cantidad) => console.log('mover', sistemaId, cantidad)}
          />
        )}
      </div>
    </div>
  );
}

export default Game;