require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,

  juego: {
    cicloProduccionSeg: parseInt(process.env.CICLO_PRODUCCION_SEG) || 20,
    porcentajeVictoria: parseInt(process.env.PORCENTAJE_VICTORIA) || 70,
    tiempoEsperaLobbySeg: parseInt(process.env.TIEMPO_ESPERA_LOBBY_SEG) || 60,

    recursosIniciales: {
      bajo:   { minerales: 100, energia: 50,  cristales: 20  },
      normal: { minerales: 300, energia: 150, cristales: 50  },
      alto:   { minerales: 500, energia: 250, cristales: 100 }
    },

    produccionPorTipo: {
      minero:     { minerales: 100, energia: 30, cristales: 10 },
      energetico: { minerales: 50,  energia: 50, cristales: 10 },
      cientifico: { minerales: 40,  energia: 40, cristales: 30 },
      balanceado: { minerales: 35,  energia: 35, cristales: 35 }
    },

    costoInstalaciones: {
      mina:      { minerales: 100, energia: 0,   cristales: 0   },
      central:   { minerales: 80,  energia: 50,  cristales: 200 },
      astillero: { minerales: 150, energia: 100, cristales: 10  },
      fortaleza: { minerales: 200, energia: 100, cristales: 30  }
    }
  }
};