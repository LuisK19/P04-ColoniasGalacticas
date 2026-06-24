import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Game from './pages/Game/Game';
import Results from './pages/Results/Results';
import CrearPartida from './pages/CrearPartida/CrearPartida';
import Partidas from './pages/Partidas/Partidas';
import Lobby from './pages/Lobby/Lobby';
import Ranking from './pages/Ranking/Ranking';

/*
 * Componente raiz de la aplicacion.
 * Define todas las rutas de navegacion entre las pantallas del juego:
 * inicio, creacion y listado de partidas, lobby, partida en curso,
 * resultados finales y ranking historico.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/crear" element={<CrearPartida />} />
        <Route path="/partidas" element={<Partidas />} />
        <Route path="/lobby/:gameId" element={<Lobby />} />
        <Route path="/game/:gameId" element={<Game />} />
        <Route path="/results/:gameId" element={<Results />} />
        <Route path="/ranking" element={<Ranking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;