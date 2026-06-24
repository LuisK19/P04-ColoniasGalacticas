import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import styles from './CrearPartida.module.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/*
 * Pantalla para configurar y crear una nueva partida.
 * El jugador define el nombre, la galaxia, la cantidad minima y maxima
 * de jugadores, el tiempo maximo de duracion y el nivel de recursos
 * iniciales antes de crear la partida y unirse automaticamente como host.
 */
function CrearPartida() {
    const navigate = useNavigate();
    const nickname = localStorage.getItem('nickname');

    const [galaxias, setGalaxias] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        nombre: '',
        galaxiaArchivo: '',
        maxJugadores: 4,
        minJugadores: 2,
        tiempoMaximo: 30,
        nivelRecursos: 'normal'
    });

    /*
     * Redirige al inicio si no hay un nickname guardado en localStorage,
     * evitando que se acceda a esta pantalla sin autenticarse primero.
     */
    useEffect(() => {
        if (!nickname) navigate('/');
    }, []);

    /*
     * Carga la lista de galaxias disponibles desde el backend al montar
     * el componente y selecciona la primera por defecto en el formulario.
     */
    useEffect(() => {
        axios.get(`${BACKEND}/galaxies`)
            .then(res => {
                setGalaxias(res.data.galaxias);
                if (res.data.galaxias.length > 0) {
                    setForm(f => ({ ...f, galaxiaArchivo: res.data.galaxias[0].archivo }));
                }
            })
            .catch(() => setError('No se pudieron cargar las galaxias'));
    }, []);

    /*
     * Actualiza el estado del formulario cuando cambia cualquier campo
     * de entrada (texto, numero o select).
     * Entrada: e - evento del input/select
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    /*
     * Valida el formulario, crea la partida en el backend, une
     * automaticamente al jugador como host, y navega al lobby
     * de la partida recien creada.
     */
    const handleCrear = async () => {
        if (!form.nombre.trim()) {
            setError('El nombre de la partida es requerido');
            return;
        }
        if (!form.galaxiaArchivo) {
            setError('Seleccioná una galaxia');
            return;
        }
        if (parseInt(form.minJugadores) > parseInt(form.maxJugadores)) {
            setError('El mínimo de jugadores no puede ser mayor al máximo');
            return;
        }

        setCargando(true);
        setError('');

        try {
            const res = await axios.post(`${BACKEND}/games`, {
                nombre: form.nombre.trim(),
                galaxiaArchivo: form.galaxiaArchivo,
                maxJugadores: parseInt(form.maxJugadores),
                minJugadores: parseInt(form.minJugadores),
                tiempoMaximo: parseInt(form.tiempoMaximo),
                nivelRecursos: form.nivelRecursos,
                host: nickname
            });

            const partidaId = res.data.partida.id;

            await axios.post(`${BACKEND}/games/${partidaId}/join`, { nickname });

            navigate(`/lobby/${partidaId}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al crear la partida');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>

                <div className={styles.header}>
                    <button className={styles.btnVolver} onClick={() => navigate('/')}>
                        <ChevronLeft size={16} />
                        Volver
                    </button>
                    <h2 className={styles.titulo}>Nueva Partida</h2>
                </div>

                <div className={styles.campos}>

                    <div className={styles.campo}>
                        <label className={styles.label}>Nombre de la partida</label>
                        <input
                            className={styles.input}
                            type="text"
                            name="nombre"
                            placeholder="Ej: Batalla por Orion"
                            value={form.nombre}
                            onChange={handleChange}
                            maxLength={50}
                        />
                    </div>

                    <div className={styles.campo}>
                        <label className={styles.label}>Galaxia</label>
                        <select
                            className={styles.input}
                            name="galaxiaArchivo"
                            value={form.galaxiaArchivo}
                            onChange={handleChange}
                        >
                            {galaxias.map(g => (
                                <option key={g.archivo} value={g.archivo}>
                                    {g.nombre} ({g.totalSistemas} sistemas, {g.totalRutas} rutas)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.fila}>
                        <div className={styles.campo}>
                            <label className={styles.label}>Mín. jugadores</label>
                            <input
                                className={styles.input}
                                type="number"
                                name="minJugadores"
                                min={2}
                                max={8}
                                value={form.minJugadores}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.campo}>
                            <label className={styles.label}>Máx. jugadores</label>
                            <input
                                className={styles.input}
                                type="number"
                                name="maxJugadores"
                                min={2}
                                max={8}
                                value={form.maxJugadores}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className={styles.campo}>
                        <label className={styles.label}>Tiempo máximo (minutos)</label>
                        <input
                            className={styles.input}
                            type="number"
                            name="tiempoMaximo"
                            min={5}
                            max={120}
                            value={form.tiempoMaximo}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.campo}>
                        <label className={styles.label}>Recursos iniciales</label>
                        <div className={styles.opciones}>
                            {[
                                { valor: 'bajo', label: 'Bajo', desc: '100 / 50 / 20', clase: styles.opcionBajo },
                                { valor: 'normal', label: 'Normal', desc: '300 / 150 / 50', clase: styles.opcionNormal },
                                { valor: 'alto', label: 'Alto', desc: '500 / 250 / 100', clase: styles.opcionAlto }
                            ].map(op => (
                                <button
                                    key={op.valor}
                                    className={`${styles.opcion} ${op.clase} ${form.nivelRecursos === op.valor ? styles.opcionActiva : ''}`}
                                    onClick={() => setForm(f => ({ ...f, nivelRecursos: op.valor }))}
                                >
                                    <span className={styles.opcionLabel}>{op.label}</span>
                                    <span className={styles.opcionDesc}>{op.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                {error && <p className={styles.error}>{error}</p>}

                <button
                    className={styles.btnCrear}
                    onClick={handleCrear}
                    disabled={cargando}
                >
                    <Rocket size={18} />
                    {cargando ? 'Creando...' : 'Crear Partida'}
                </button>

            </div>
        </div>
    );
}

export default CrearPartida;