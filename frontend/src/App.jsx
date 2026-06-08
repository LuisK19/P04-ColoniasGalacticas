import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import Results from './pages/Results';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:gameId" element={<Game />} />
        <Route path="/results/:gameId" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;