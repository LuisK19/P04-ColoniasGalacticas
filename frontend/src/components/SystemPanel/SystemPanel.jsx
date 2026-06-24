import { useState, useRef } from 'react';
import { X, Rocket, Shield, Zap, Mountain, FlaskConical } from 'lucide-react';
import styles from './SystemPanel.module.css';

/*
 * Definicion de instalaciones disponibles para construir.
 * Cada entrada tiene el tipo, etiqueta, costo legible e icono.
 */
const INSTALACIONES = [
  { tipo: 'mina',      label: 'Mina',      costo: '100 min',        costoDetalle: { minerales: 100, energia: 0,   cristales: 0   }, icono: <Mountain size={13} /> },
  { tipo: 'central',   label: 'Central',   costo: '80m+50e+200c',   costoDetalle: { minerales: 80,  energia: 50,  cristales: 200 }, icono: <FlaskConical size={13} /> },
  { tipo: 'astillero', label: 'Astillero', costo: '150m+100e+10c',  costoDetalle: { minerales: 150, energia: 100, cristales: 10  }, icono: <Rocket size={13} /> },
  { tipo: 'fortaleza', label: 'Fortaleza', costo: '200m+100e+30c',  costoDetalle: { minerales: 200, energia: 100, cristales: 30  }, icono: <Shield size={13} /> },
];

/*
 * Panel lateral que muestra informacion de un sistema planetario.
 * Incluye confirmacion antes de construir instalaciones o mover flotas.
 * Entrada: sistema - objeto con datos del sistema seleccionado
 * Entrada: onCerrar - funcion para cerrar el panel
 * Entrada: nickname - nickname del jugador actual
 * Entrada: onConstruir - funcion para construir una instalacion
 * Entrada: onMoverFlotas - funcion para iniciar el movimiento de flotas
 */
function SystemPanel({ sistema, onCerrar, nickname, onConstruir, onMoverFlotas }) {
  // Confirmacion pendiente: { tipo: 'construccion'|'flota', datos: {...} }
  const [confirmacion, setConfirmacion] = useState(null);

  // Ref del input de cantidad de flotas para leer su valor al confirmar
  const inputFlotasRef = useRef(null);

  if (!sistema) return null;

  const esPropio  = sistema.propietario === nickname;
  const esLibre   = !sistema.propietario;
  const esEnemigo = !esPropio && !esLibre;

  const iconoTipo = {
    minero:     <Mountain size={14} />,
    energetico: <Zap size={14} />,
    cientifico: <FlaskConical size={14} />,
    balanceado: <Shield size={14} />
  };

  const colorEstado = esPropio ? styles.estadoPropio :
                      esLibre  ? styles.estadoLibre  :
                                 styles.estadoEnemigo;

  /*
   * Abre el modal de confirmacion para construir una instalacion.
   * Entrada: instalacion - objeto de INSTALACIONES con tipo, label, costo e icono
   */
  const pedirConfirmacionConstruir = (instalacion) => {
    setConfirmacion({
      tipo: 'construccion',
      titulo: `Construir ${instalacion.label}`,
      descripcion: `Confirmas la construccion de un/a ${instalacion.label} en ${sistema.nombre}?`,
      detalleCosto: instalacion.costoDetalle,
      onConfirmar: () => {
        onConstruir && onConstruir(sistema.id, instalacion.tipo);
        setConfirmacion(null);
      }
    });
  };

  /*
   * Abre el modal de confirmacion para mover flotas.
   * Lee la cantidad del input y valida que sea mayor a cero.
   */
  const pedirConfirmacionMover = () => {
    const cantidad = parseInt(inputFlotasRef.current?.value || '1');
    if (!cantidad || cantidad <= 0) return;

    setConfirmacion({
      tipo: 'flota',
      titulo: 'Mover flotas',
      descripcion: `Confirmas el envio de ${cantidad} flotas desde ${sistema.nombre}? Luego selecciona el sistema destino en el mapa.`,
      cantidad,
      onConfirmar: () => {
        onMoverFlotas && onMoverFlotas(sistema.id, cantidad);
        setConfirmacion(null);
      }
    });
  };

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
        <h4 className={styles.seccionTitulo}>Produccion por ciclo</h4>
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
            {INSTALACIONES.map(item => (
              <button
                key={item.tipo}
                className={styles.btnConstruir}
                onClick={() => pedirConfirmacionConstruir(item)}
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
              ref={inputFlotasRef}
              className={styles.inputFlotas}
              type="number"
              min={1}
              max={sistema.flotas}
              defaultValue={1}
            />
            <button
              className={styles.btnMover}
              onClick={pedirConfirmacionMover}
            >
              <Rocket size={14} />
              Enviar flotas
            </button>
          </div>
          <p className={styles.infoMuted}>
            Selecciona el sistema destino en el mapa despues de confirmar.
          </p>
        </div>
      )}

      {(esLibre || esEnemigo) && sistema.flotas > 0 && (
        <div className={styles.seccion}>
          <p className={styles.infoMuted}>
            {esLibre
              ? 'Envia flotas para tomar control de este sistema.'
              : 'Envia flotas para conquistar este sistema enemigo.'}
          </p>
        </div>
      )}

      {/* Modal de confirmacion */}
      {confirmacion && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h4 className={styles.modalTitulo}>{confirmacion.titulo}</h4>
            <p className={styles.modalDescripcion}>{confirmacion.descripcion}</p>

            {/* Detalle del costo para construcciones */}
            {confirmacion.detalleCosto && (
              <div className={styles.modalCosto}>
                {confirmacion.detalleCosto.minerales > 0 && (
                  <span className={styles.costoItem}>
                    <Mountain size={12} className={styles.iconoMineral} />
                    {confirmacion.detalleCosto.minerales}
                  </span>
                )}
                {confirmacion.detalleCosto.energia > 0 && (
                  <span className={styles.costoItem}>
                    <Zap size={12} className={styles.iconoEnergia} />
                    {confirmacion.detalleCosto.energia}
                  </span>
                )}
                {confirmacion.detalleCosto.cristales > 0 && (
                  <span className={styles.costoItem}>
                    <FlaskConical size={12} className={styles.iconoCristal} />
                    {confirmacion.detalleCosto.cristales}
                  </span>
                )}
              </div>
            )}

            <div className={styles.modalBotones}>
              <button
                className={styles.btnCancelarModal}
                onClick={() => setConfirmacion(null)}
              >
                Cancelar
              </button>
              <button
                className={styles.btnConfirmar}
                onClick={confirmacion.onConfirmar}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SystemPanel;
