import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/*
 * Instancia compartida del cliente de Socket.IO.
 * No se conecta automaticamente: cada pantalla que necesita comunicacion
 * en tiempo real llama a socket.connect() al montar y socket.disconnect()
 * al desmontar, evitando conexiones innecesarias en pantallas estaticas.
 */
export const socket = io(URL, {
  autoConnect: false
});