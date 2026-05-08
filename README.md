# Spotify-Like Music Streaming System

![HTML5](https://img.shields.io/badge/HTML5-Frontend-e34f26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Styling-1572b6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-App%20Logic-f7df1e?logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Domain%20Types-3178c6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Schema-4169e1?logo=postgresql&logoColor=white)
![Cassandra](https://img.shields.io/badge/Cassandra-Event%20History-1287b1?logo=apachecassandra&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ed?logo=docker&logoColor=white)

This is a working full-stack music streaming site. It uses a browser frontend, a Node.js backend API, seekable local audio streams, and JSON persistence, while organizing the backend around the architectural and design patterns from `num5.doc`.

## What The Site Does

- login with a demo account
- Ethiopian music catalog browsing and search
- playlist creation and song assignment
- favorites
- real browser audio playback through a streaming endpoint
- recent activity
- personalized recommendations
- playable demo tracks with seekable audio streams
- album-style cover art and richer discovery sections
- genre filtering, spotlight track, listening insights, and playlist playback
- Dockerized local deployment

## Demo Login

```text
Username: merkeb
Password: 1234
```

## Architecture And Design Patterns Applied

- API Gateway Pattern: `src/gateway/apiGateway.js` is the single API entry point and routes requests to internal services.
- Microservices Pattern: the backend is split into domain services for auth, catalog, playlist, playback, recommendation, analytics, and architecture metadata.
- Event-Driven Architecture: `src/events/eventBus.js` publishes events such as `song_played` and `playlist_updated`.
- Backend for Frontend: `GET /api/bff/web-home` returns one web-shaped payload for the browser.
- CQRS Pattern: read endpoints call query services, while POST endpoints call command services that mutate `data/store.json`.
- Circuit Breaker Pattern: recommendation calls in the BFF are wrapped by `src/infrastructure/circuitBreaker.js`.
- Repository Pattern: `src/repositories/jsonStoreRepository.js` isolates data access.
- Service Layer Pattern: business rules live in `src/services`.
- Observer Pattern: analytics and recommendation consumers react independently to published events.
- Factory Pattern: `src/factories` creates recommendation strategies and stream handlers from environment configuration.

## Technology Stack

- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js HTTP server
- Typed domain model: TypeScript interfaces in `src/types/domain.ts`
- Streaming: local object-storage style media files served through `GET /api/stream/:id`
- Persistence in this runnable version: JSON repository in `data/store.json`
- Production metadata model: PostgreSQL schema in `database/postgres/schema.sql`
- Production listening history model: Cassandra CQL schema in `database/cassandra/listening_history.cql`
- Containerization: Docker and Docker Compose

## Project Structure

```text
prototype 1/
  Dockerfile
  docker-compose.yml
  package.json
  server.js
  data/
    store.json
  database/
    cassandra/
      listening_history.cql
    postgres/
      schema.sql
  media/
    song-1.wav
    ...
  public/
    app.js
    home.html
    index.html
    login.html
    login.js
    styles.css
  src/
    config/
    events/
    factories/
    gateway/
    http/
    infrastructure/
    repositories/
    services/
```

If the generated demo audio files are missing, recreate them with:

```powershell
npm run generate-audio
```

## Run Locally

```powershell
npm start
```

Open:

```text
http://localhost:3000
```

If port 3000 is busy:

```powershell
$env:PORT=3001
npm start
```

## Run With Docker

Build and start with Docker Compose:

```powershell
docker compose up --build
```

Open:

```text
http://localhost:3000
```

Stop the container:

```powershell
docker compose down
```

The compose file mounts `./data` into the container so site data changes persist on your machine.

## API Endpoints

- `GET /api/health`
- `GET /api/stream/:id`
- `POST /api/login`
- `GET /api/bff/web-home`
- `GET /api/architecture`
- `GET /api/songs`
- `GET /api/home`
- `GET /api/recommendations`
- `GET /api/playlists`
- `POST /api/playlists`
- `POST /api/playlists/:id/songs`
- `POST /api/play/:id`
- `POST /api/favorites/:id`
- `GET /api/activity`

## Environment Options

- `PORT`: server port, default `3000`
- `DATA_FILE`: alternate JSON data file path
- `STREAM_PROVIDER`: `cdn` or `local`
- `RECOMMENDATION_STRATEGY`: `genre` or `trending`

## Course Requirement Fit

The site shows interaction between at least three modules:

1. The frontend sends browser actions to the backend.
2. The API gateway routes requests to service-layer modules.
3. The repository persists and retrieves data from `data/store.json`.

It also maps the final architecture brief to a runnable site without exposing those patterns as interface content. PostgreSQL, Cassandra, Redis, Kafka, object storage, and CDN remain represented as production architecture targets while this local version uses lightweight equivalents.
