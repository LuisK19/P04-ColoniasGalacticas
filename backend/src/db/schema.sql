CREATE TABLE IF NOT EXISTS galaxias (
  id      SERIAL PRIMARY KEY,
  nombre  VARCHAR(100) UNIQUE NOT NULL,
  archivo VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS partidas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          VARCHAR(100) NOT NULL,
  galaxia         VARCHAR(100) NOT NULL,
  max_jugadores   INT NOT NULL,
  tiempo_maximo   INT NOT NULL,
  nivel_recursos  VARCHAR(10) NOT NULL,
  estado          VARCHAR(15) DEFAULT 'esperando',
  creada_en       TIMESTAMP DEFAULT NOW(),
  finalizada_en   TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jugadores_partida (
  id                  SERIAL PRIMARY KEY,
  partida_id          UUID REFERENCES partidas(id),
  nickname            VARCHAR(50) NOT NULL,
  posicion            INT,
  puntaje_final       INT,
  sistemas_finales    INT,
  flotas_final        INT,
  minas_finales       INT,
  centros_finales     INT,
  fortalezas_finales  INT,
  minerales_finales   INT,
  energia_final       INT,
  cristales_finales   INT
);

CREATE TABLE IF NOT EXISTS ranking (
  id                   SERIAL PRIMARY KEY,
  partida_id           UUID REFERENCES partidas(id) UNIQUE,
  ganador_nickname     VARCHAR(50) NOT NULL,
  sistemas_controlados INT NOT NULL,
  minerales            INT NOT NULL,
  energia              INT NOT NULL,
  cristales            INT NOT NULL,
  galaxia              VARCHAR(100) NOT NULL,
  tiempo_juego_seg     INT NOT NULL,
  fecha_partida        TIMESTAMP DEFAULT NOW()
);