import { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import styles from './GalaxyMap.module.css';

/*
 * Componente que renderiza el mapa galáctico usando Vis.js.
 * Entrada: sistemas - objeto con todos los sistemas planetarios
 * Entrada: adyacencia - objeto con las conexiones entre sistemas
 * Entrada: onClickSistema - función que se llama al hacer clic en un nodo
 * Entrada: nickname - nickname del jugador actual
 */
function GalaxyMap({ sistemas = {}, adyacencia = {}, onClickSistema, nickname }) {
    const containerRef = useRef(null);
    const networkRef = useRef(null);

    /*
     * Devuelve la ruta de imagen según el tipo de planeta.
     * Entrada: tipo - tipo del sistema planetario
     */
    const imagenPorTipo = (tipo) => {
        const imagenes = {
            minero: '/planets/minero.png',
            energetico: '/planets/energetico.png',
            cientifico: '/planets/cientifico.png',
            balanceado: '/planets/balanceado.png'
        };
        return imagenes[tipo] || '/planets/balanceado.png';
    };

    /*
     * Devuelve el color del borde según el propietario del sistema.
     */
    const colorBorde = (sistema) => {
        if (!sistema.propietario) return '#2a3f60';
        if (sistema.propietario === nickname) return '#f0c040';
        return '#c0392b';
    };
    /*
     * Construye el label del nodo con nombre y estado.
     */
    const labelNodo = (sistema) => {
        const propietario = sistema.propietario ? `\n(${sistema.propietario})` : '';
        return `${sistema.nombre}${propietario}`;
    };

    useEffect(() => {
        if (!containerRef.current || Object.keys(sistemas).length === 0) return;

        // Construir nodos
        const nodos = new DataSet(
            Object.values(sistemas).map(s => ({
                id: s.id,
                label: labelNodo(s),
                image: imagenPorTipo(s.tipo),
                shape: 'circularImage',
                size: 28,
                borderWidth: 3,
                color: {
                    border: colorBorde(s),
                    highlight: { border: colorBorde(s) }
                },
                font: { color: '#c9d6e3', size: 11, face: 'system-ui' },
                title: `${s.nombre} — ${s.tipo}`
            }))
        );
        // Construir aristas desde adyacencia (evitar duplicados)
        const aristasVistas = new Set();
        const aristasArr = [];

        for (const [origen, destinos] of Object.entries(adyacencia)) {
            for (const destino of destinos) {
                const clave = [origen, destino].sort().join('-');
                if (!aristasVistas.has(clave)) {
                    aristasVistas.add(clave);
                    aristasArr.push({ from: origen, to: destino });
                }
            }
        }

        const aristas = new DataSet(aristasArr);

        const opciones = {
            nodes: {
                borderWidth: 2,
                shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', size: 8 }
            },
            edges: {
                color: { color: '#1e2d45', highlight: '#4ab8c8' },
                width: 1.5,
                smooth: { type: 'continuous' }
            },
            physics: {
                stabilization: { iterations: 150 },
                barnesHut: {
                    gravitationalConstant: -3000,
                    springLength: 120,
                    springConstant: 0.04
                }
            },
            interaction: {
                hover: true,
                tooltipDelay: 200,
                zoomView: true,
                dragView: true
            },
            background: 'transparent'
        };

        networkRef.current = new Network(containerRef.current, { nodes: nodos, edges: aristas }, opciones);

        // Emitir el sistema clickeado al componente padre
        networkRef.current.on('click', (params) => {
            if (params.nodes.length > 0 && onClickSistema) {
                const sistemaId = params.nodes[0];
                onClickSistema(sistemas[sistemaId]);
            }
        });

        return () => {
            if (networkRef.current) {
                networkRef.current.destroy();
                networkRef.current = null;
            }
        };
    }, [sistemas, adyacencia, nickname, onClickSistema, colorBorde, labelNodo]);

    return (
        <div className={styles.wrapper}>
            <div ref={containerRef} className={styles.mapa} />
        </div>
    );
}

export default GalaxyMap;