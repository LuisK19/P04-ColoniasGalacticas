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
 * Entrada: origenFlota - id del sistema origen cuando se está eligiendo destino para mover flotas, o null
 */
function GalaxyMap({ sistemas = {}, adyacencia = {}, onClickSistema, nickname, origenFlota }) {
    const containerRef = useRef(null);
    const networkRef = useRef(null);
    const nodosRef = useRef(null);
    const aristasRef = useRef(null);
    const onClickRef = useRef(onClickSistema);
    const hoverActualRef = useRef(null);

    onClickRef.current = onClickSistema;

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
     * Devuelve el color de borde de un nodo según su propietario,
     * salvo que esté en modo selección de destino para flotas.
     */
    const colorBorde = (sistema) => {
        if (origenFlota && sistema.id === origenFlota) return '#f0c040';
        if (!sistema.propietario) return '#2a3f60';
        if (sistema.propietario === nickname) return '#f0c040';
        return '#c0392b';
    };

    const labelNodo = (sistema) => {
        const propietario = sistema.propietario ? `\n(${sistema.propietario})` : '';
        return `${sistema.nombre}${propietario}`;
    };

    // Crea la red una sola vez, mientras la adyacencia no cambie
    useEffect(() => {
        if (!containerRef.current || Object.keys(sistemas).length === 0) return;
        if (networkRef.current) return;

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

        nodosRef.current = nodos;
        aristasRef.current = aristas;

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
            }
        };

        networkRef.current = new Network(containerRef.current, { nodes: nodos, edges: aristas }, opciones);

        networkRef.current.on('click', (params) => {
            if (params.nodes.length > 0 && onClickRef.current) {
                const sistemaId = params.nodes[0];
                onClickRef.current(sistemas[sistemaId]);
            }
        });

        networkRef.current.on('hoverNode', (params) => {
            hoverActualRef.current = params.node;
            aplicarColoresHover();
        });

        networkRef.current.on('blurNode', () => {
            hoverActualRef.current = null;
            aplicarColoresHover();
        });
        networkRef.current.once('stabilizationIterationsDone', () => {
            networkRef.current.setOptions({ physics: false });
        });

        return () => {
            if (networkRef.current) {
                networkRef.current.destroy();
                networkRef.current = null;
                nodosRef.current = null;
                aristasRef.current = null;
            }
        };
    }, [adyacencia]);

    /*
     * Aplica el color verde al nodo sobre el que está el mouse
     * cuando hay una flota en modo selección de destino.
     */
    const aplicarColoresHover = () => {
        if (!nodosRef.current) return;
        if (!origenFlota) return;

        const actualizaciones = Object.values(sistemas).map(s => {
            let border = colorBorde(s);
            if (s.id === hoverActualRef.current && s.id !== origenFlota) {
                border = '#1a7a4a';
            }
            return {
                id: s.id,
                color: { border, highlight: { border } }
            };
        });

        nodosRef.current.update(actualizaciones);
    };

    // Actualiza solo los datos visuales de los nodos existentes, sin recrear la red
    useEffect(() => {
        if (!nodosRef.current) return;

        const actualizaciones = Object.values(sistemas).map(s => ({
            id: s.id,
            label: labelNodo(s),
            color: {
                border: colorBorde(s),
                highlight: { border: colorBorde(s) }
            },
            title: `${s.nombre} — ${s.tipo}`
        }));

        nodosRef.current.update(actualizaciones);
    }, [sistemas, nickname, origenFlota]);

    return (
        <div className={styles.wrapper}>
            <div ref={containerRef} className={styles.mapa} />
        </div>
    );
}

export default GalaxyMap;