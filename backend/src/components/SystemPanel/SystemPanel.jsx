import { X, Rocket, Shield, Zap, Mountain, FlaskConical } from 'lucide-react';
import styles from './SystemPanel.module.css';

/*
 * Panel lateral que muestra información de un sistema planetario.
 * Aparece al hacer clic en un nodo del mapa galáctico.
 * Entrada: sistema - objeto con datos del sistema seleccionado
 * Entrada: onCerrar - función para cerrar el panel
 * Entrada: nickname - nickname del jugador actual
 * Entrada: onConstruir - función para construir una instalación
 * Entrada: onMoverFlotas - función para mover flotas
 */
function SystemPanel({ sistema, onCerrar, nickname, onConstruir, onMoverFlotas }) {
  if (!sistema) return null;

  const esPropio    = sistema.propietario === nickname;
  const esLibre     = !sistema.propietario;
  const esEnemigo   = !esPropio && !esLibre;

  const iconoTipo = {
    minero:     <Mountain size={14} />,
    energetico: <Zap size={14} />,
    cientifico: <FlaskConical size={14} />,
    balanceado: <Shield size={14} />
  };

  const colorEstado = esPropio ? styles.estadoPropio :
                      esLibre  ? styles.estadoLibre  :
                                 styles.estadoEnemigo;

  return (
    <div className={styles.panel}>

      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h3 className={styles.nombre}>{sistema.nombre}</h3>
          <span className={`${styles.estado} ${colorEstado}`}>
            {esPropio ? 'Controlado por vos' : esLibre ? 'Libre' : `Enemigo: ${sistema.propietario}`}
          </span>
        </div>
        <button className={styles.btnCerrar} onClick={onCerrar}>
          <X size={16} />
        </button>
      </div>

      <div className={styles.seccion}>
        <div className={styles.fila}>
          <span className={styles.etiqueta}>Tipo</span>
          <span className={styles.valor}>
            {iconoTipo[sistema.tipo]}
            {sistema.tipo.charAt(0).toUpperCase() + sistema.tipo.slice(1)}
          </span>
        </div>
        <div className={styles.fila}>
          <span className={styles.etiqueta}>Flotas</span>
          <span className={styles.valor}>{sistema.flotas}</span>
        </div>
        <div className={styles.fila}>
          <span className={styles.etiqueta}>Estado</span>
          <span className={styles.valor}>{sistema.estado}</span>
        </div>
        {sistema.descripcion && (
          <p className={styles.descripcion}>{sistema.descripcion}</p>
        )}
      </div>

      <div className={styles.seccion}>
        <h4 className={styles.seccionTitulo}>Producción por ciclo</h4>
        <div className={styles.produccion}>
          <div className={styles.recurso}>
            <Mountain size={13} className={styles.iconoMineral} />
            <span>{sistema.produccion?.minerales ?? 0}</span>
          </div>
          <div className={styles.recurso}>
            <Zap size={13} className={styles.iconoEnergia} />
            <span>{sistema.produccion?.energia ?? 0}</span>
          </div>
          <div className={styles.recurso}>
            <FlaskConical size={13} className={styles.iconoCristal} />
            <span>{sistema.produccion?.cristales ?? 0}</span>
          </div>
        </div>
      </div>

      <div className={styles.seccion}>
        <h4 className={styles.seccionTitulo}>Instalaciones</h4>
        <div className={styles.instalaciones}>
          <div className={styles.instalacion}>
            <Mountain size={13} />
            <span>Minas</span>
            <span className={styles.cantidad}>{sistema.instalaciones?.minas ?? 0}</span>
          </div>
          <div className={styles.instalacion}>
            <FlaskConical size={13} />
            <span>Centrales</span>
            <span className={styles.cantidad}>{sistema.instalaciones?.centrales ?? 0}</span>
          </div>
          <div className={styles.instalacion}>
            <Rocket size={13} />
            <span>Astilleros</span>
            <span className={styles.cantidad}>{sistema.instalaciones?.astilleros ?? 0}</span>
          </div>
          <div className={styles.instalacion}>
            <Shield size={13} />
            <span>Fortalezas</span>
            <span className={styles.cantidad}>{sistema.instalaciones?.fortalezas ?? 0}</span>
          </div>
        </div>
      </div>

      {esPropio && (
        <div className={styles.seccion}>
          <h4 className={styles.seccionTitulo}>Construir</h4>
          <div className={styles.botonesAccion}>
            {[
              { tipo: 'mina',      label: 'Mina',      costo: '100 min',              icono: <Mountain size={13} /> },
              { tipo: 'central',   label: 'Central',   costo: '80m+50e+200c',         icono: <FlaskConical size={13} /> },
              { tipo: 'astillero', label: 'Astillero', costo: '150m+100e+10c',        icono: <Rocket size={13} /> },
              { tipo: 'fortaleza', label: 'Fortaleza', costo: '200m+100e+30c',        icono: <Shield size={13} /> },
            ].map(item => (
              <button
                key={item.tipo}
                className={styles.btnConstruir}
                onClick={() => onConstruir && onConstruir(sistema.id, item.tipo)}
              >
                {item.icono}
                <div className={styles.btnInfo}>
                  <span className={styles.btnLabel}>{item.label}</span>
                  <span className={styles.btnCosto}>{item.costo}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {esPropio && (
        <div className={styles.seccion}>
          <h4 className={styles.seccionTitulo}>Mover flotas</h4>
          <div className={styles.moverFlotas}>
            <input
              className={styles.inputFlotas}
              type="number"
              min={1}
              max={sistema.flotas}
              defaultValue={1}
              id="cantidadFlotas"
            />
            <button
              className={styles.btnMover}
              onClick={() => {
                const cantidad = parseInt(document.getElementById('cantidadFlotas').value);
                onMoverFlotas && onMoverFlotas(sistema.id, cantidad);
              }}
            >
              <Rocket size={14} />
              Enviar flotas
            </button>
          </div>
          <p className={styles.infoMuted}>
            Hacé clic en el sistema destino después de enviar.
          </p>
        </div>
      )}

      {(esLibre || esEnemigo) && sistema.flotas > 0 && (
        <div className={styles.seccion}>
          <p className={styles.infoMuted}>
            {esLibre
              ? 'Enviá flotas para tomar control de este sistema.'
              : 'Enviá flotas para conquistar este sistema enemigo.'}
          </p>
        </div>
      )}

    </div>
  );
}

export default SystemPanel;