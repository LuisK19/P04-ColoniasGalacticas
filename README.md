# Colonias Galacticas

Juego de estrategia espacial multijugador en tiempo real, desarrollado como Proyecto Programado 4 del curso Lenguajes de Programacion, Instituto Tecnologico de Costa Rica, I Semestre 2026.

Los jugadores se conectan a una galaxia compartida, representada como un grafo de sistemas planetarios y rutas espaciales, y compiten por el control del territorio mediante la administracion de recursos, la construccion de instalaciones y la movilizacion de flotas militares.

## Integrantes

- Luis Trejos Rivera, carnet 2022437816
- Esteban Rodriguez Vargas, carnet 2022131105

## Stack tecnologico

**Backend**
- Node.js con Express
- Socket.IO para comunicacion en tiempo real
- PostgreSQL como base de datos

**Frontend**
- React con Vite
- Vis.js para el renderizado del mapa galactico
- Socket.IO Client
- Lucide React para iconografia

## Estructura del proyecto

```
colonias-galacticas/
├── backend/
│   ├── src/
│   │   ├── config/      Configuracion centralizada del juego
│   │   ├── db/          Conexion a PostgreSQL y esquema SQL
│   │   ├── game/        GalaxyLoader y GameManager (logica del dominio)
│   │   ├── routes/      Endpoints REST
│   │   └── sockets/     Eventos de WebSocket
│   ├── galaxias/        Archivos JSON de galaxias disponibles
│   └── app.js
└── frontend/
    └── src/
        ├── pages/        Pantallas principales de la aplicacion
        ├── components/   Componentes reutilizables
        └── socket/       Instancia compartida del cliente de Socket.IO
```

## Requisitos previos

- Node.js 18 o superior
- PostgreSQL instalado localmente, o acceso a una instancia remota
- Git

## Instalacion

Clonar el repositorio:

```bash
git clone https://github.com/LuisK19/P04-ColoniasGalacticas.git
cd colonias-galacticas
```

Instalar dependencias del backend:

```bash
cd backend
npm install
```

Instalar dependencias del frontend:

```bash
cd ../frontend
npm install
```

## Configuracion de la base de datos

Crear una base de datos llamada `colonias_galacticas` en PostgreSQL y ejecutar el archivo `backend/src/db/schema.sql` en esa base de datos para crear las tablas necesarias.

## Variables de entorno

Crear un archivo `.env` dentro de `backend` con el siguiente contenido de referencia:

```env
PORT=3000
DB_MODE=local
DATABASE_URL_LOCAL=postgresql://postgres:TU_PASSWORD@localhost:5432/colonias_galacticas
DATABASE_URL_REMOTA=postgresql://usuario:password@host:5432/colonias_galacticas
JWT_SECRET=colonias_galacticas_secret_2026
CICLO_PRODUCCION_SEG=20
PORCENTAJE_VICTORIA=70
TIEMPO_ESPERA_LOBBY_SEG=60
```

El parametro `DB_MODE` permite alternar entre una base de datos local y una remota sin modificar el codigo, simplemente cambiando su valor entre `local` y `remota`.

Crear un archivo `.env` dentro de `frontend` con el siguiente contenido:

```env
VITE_BACKEND_URL=http://localhost:3000
```
O tambien se si se usa el Port Foward de vsCode hay que cambiar el localhost por el url que da este puerto.

## Ejecucion

Iniciar el backend:

```bash
cd backend
npm run dev
```

Iniciar el frontend en otra terminal:

```bash
cd frontend
npm run dev
```

La aplicacion queda disponible en `http://localhost:5173`.

## Flujo de uso

1. El jugador ingresa un nickname en la pantalla principal.
2. Puede crear una partida nueva, unirse a una partida existente, o consultar el ranking historico.
3. Al crear una partida se configura el nombre, la galaxia, la cantidad minima y maxima de jugadores, el tiempo maximo y el nivel de recursos iniciales.
4. Los jugadores ingresan a una sala de espera con actualizacion en tiempo real.
5. El host de la partida la inicia presionando la tecla U o el boton correspondiente, una vez alcanzado el minimo de jugadores configurado.
6. Durante la partida, cada jugador interactua con el mapa galactico para construir instalaciones y movilizar flotas hacia sistemas conectados.
7. La partida finaliza por dominio territorial, por tiempo maximo, o por quedar un unico jugador activo.
8. Al finalizar se muestran los resultados y se actualiza el ranking historico.

## Funcionalidades principales

- Carga de galaxias desde archivos JSON con construccion del grafo en memoria.
- Sincronizacion en tiempo real entre todos los jugadores de una partida mediante WebSockets.
- Ciclo automatico de produccion de recursos configurable.
- Construccion de instalaciones: minas, centrales de investigacion, astilleros y fortalezas.
- Movilizacion de flotas respetando las conexiones del grafo.
- Resolucion automatica de combate entre flotas e instalaciones defensivas.
- Persistencia de estadisticas finales y ranking historico en PostgreSQL.
- Indicadores en tiempo real de tiempo restante y progreso hacia la victoria.

## Repositorio

https://github.com/LuisK19/P04-ColoniasGalacticas
