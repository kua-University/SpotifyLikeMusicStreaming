# Spotify-Like Prototype

This prototype is a working demonstration for the `Spotify-Like Music Streaming System` project.

It still proves interaction between at least three modules:

- Module 1: Frontend user interface
- Module 2: Backend API
- Module 3: Persistent local data storage

It now feels more realistic by using Ethiopian music data and a richer streaming-style experience.

## 1. What This Prototype Does

The prototype allows a user to:

- browse an Ethiopian music catalog
- search songs, artists, albums, genres, and moods
- create playlists
- add songs to playlists
- mark songs as favorites
- view featured playlists
- view simple recommendations
- simulate playing a song
- view recently played and activity history

## 2. Modules in the Prototype

This prototype satisfies the instructor requirement because it clearly contains these 3 interacting modules:

1. Frontend Module
2. Backend Module
3. Data Storage Module

### Frontend Module

Files:

- [public/index.html](C:\Users\HP\OneDrive\Desktop\SADproject\prototype\public\index.html)
- [public/app.js](C:\Users\HP\OneDrive\Desktop\SADproject\prototype\public\app.js)
- [public/styles.css](C:\Users\HP\OneDrive\Desktop\SADproject\prototype\public\styles.css)

Responsibilities:

- displays songs, playlists, favorites, and recommendations
- lets the user search the catalog
- lets the user create playlists
- lets the user favorite songs
- lets the user simulate playback
- sends requests to the backend API

### Backend Module

File:

- [server.js](C:\Users\HP\OneDrive\Desktop\SADproject\prototype\server.js)

Responsibilities:

- serves the frontend files
- exposes HTTP API endpoints
- reads and writes application data
- updates play counts
- updates favorite state
- records playback activity
- prepares home dashboard and recommendation data

### Data Storage Module

File:

- [data/store.json](C:\Users\HP\OneDrive\Desktop\SADproject\prototype\data\store.json)

Responsibilities:

- stores Ethiopian song metadata
- stores playlists
- stores playback activity
- stores favorite-song state for the demo user

This acts as the persistence layer for the prototype.

## 3. Technology Used

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js built-in `http` module
- Storage: local JSON file

No external npm packages are required.

## 4. Folder Structure

```text
prototype/
  package.json
  server.js
  README.md
  data/
    store.json
  public/
    index.html
    app.js
    styles.css
```

## 5. Requirements

Before running the prototype, make sure you have:

- Node.js installed

## 6. How to Run the Prototype

Open a terminal and run:

```powershell
cd C:\Users\HP\OneDrive\Desktop\SADproject\prototype
npm start
```

After the server starts, open this in your browser:

```text
http://localhost:3000
```

If it starts correctly, you should see:

```text
Prototype running at http://localhost:3000
```

## 7. How to Use the Prototype

### Browse the Catalog

When the page opens, the frontend loads songs, playlists, favorites, dashboard stats, and recommendations from the backend.

### Search

Use the search box to filter Ethiopian songs by title, artist, album, genre, or mood.

### Create a Playlist

1. Enter a playlist name
2. Click `Create Playlist`
3. The frontend sends the request to the backend
4. The backend writes the new playlist into `store.json`

### Add a Song to a Playlist

1. Find a song in the catalog
2. Use the dropdown next to the song
3. Choose a playlist
4. The backend updates stored playlist data

### Favorite a Song

1. Click `Favorite` on a song card
2. The backend updates the demo user's favorite list
3. The favorites panel refreshes immediately

### Play a Song

1. Click `Play`
2. The frontend sends a playback request to the backend
3. The backend increases play count
4. The backend writes a playback event to `store.json`
5. The frontend refreshes recent activity and recommendation context

## 8. API Endpoints

### `GET /api/songs`

Returns the Ethiopian song catalog.

Optional query parameters:

- `q` for search
- `genre` for genre filtering

### `GET /api/home`

Returns dashboard data such as:

- demo user info
- stats
- featured playlists
- favorite songs
- trending songs
- recently played entries

### `GET /api/recommendations`

Returns simple recommendation results based on the demo user's favorites.

### `GET /api/playlists`

Returns all playlists.

### `POST /api/playlists`

Creates a new playlist.

Example request body:

```json
{
  "name": "Late Night Addis"
}
```

### `POST /api/playlists/:id/songs`

Adds a song to a playlist.

Example request body:

```json
{
  "songId": "song-1"
}
```

### `POST /api/play/:id`

Simulates playing a song.

What it does:

- increases play count
- records a playback event

### `POST /api/favorites/:id`

Toggles whether a song is in the demo user's favorites list.

### `GET /api/activity`

Returns recorded activity events.

## 9. What Proves the Course Requirement

This prototype satisfies the course requirement in these ways:

### Interaction Between at Least Three Modules

- frontend UI sends requests
- backend API processes requests
- data storage saves and returns data

The three modules interact like this:

1. The frontend sends user actions or data requests.
2. The backend receives the API request and applies application logic.
3. The backend reads from or writes to `store.json`.
4. The backend sends updated results back to the frontend.

### API Communication

The frontend uses endpoints such as:

- `/api/songs`
- `/api/home`
- `/api/recommendations`
- `/api/playlists`
- `/api/play/:id`
- `/api/favorites/:id`
- `/api/activity`

### Data Storage and Retrieval

The backend reads from and writes to [store.json](C:\Users\HP\OneDrive\Desktop\SADproject\prototype\data\store.json).

### User Interaction

The user can:

- browse songs
- search the catalog
- create playlists
- add songs to playlists
- favorite songs
- play songs
- view recommendations
- view playback history

## 10. Important Notes

- This is still a prototype, not a full production system.
- Audio playback is simulated through API interaction and activity logging.
- It uses local JSON storage for simplicity instead of PostgreSQL, Cassandra, Redis, or Kafka.
- The catalog has been localized with Ethiopian artists and titles so the prototype better matches the project theme.

## 11. Suggested Demo Script for Presentation

You can present the prototype like this:

1. Start the server with `npm start`
2. Open `http://localhost:3000`
3. Show the Ethiopian catalog
4. Show featured playlists and recommendations
5. Search for a song or artist
6. Create a new playlist
7. Add a song to the playlist
8. Favorite a song
9. Click `Play` on a song
10. Show that play count and activity update
11. Explain that this demonstrates frontend, backend, and storage interaction

## 12. Possible Future Improvements

If you want to extend it later, you could add:

- real audio file playback
- a database such as PostgreSQL
- user login and sessions
- artist upload workflows
- recommendation ranking logic
- Docker support
- separate deployable microservices

## 13. Troubleshooting

### Port 3000 Already In Use

If port `3000` is busy, run:

```powershell
$env:PORT=3001
npm start
```

Then open:

```text
http://localhost:3001
```

### Page Does Not Load

Check:

- Node.js is installed
- you are inside the `prototype` folder
- the server started without errors

### Data Does Not Update

Check whether [store.json](C:\Users\HP\OneDrive\Desktop\SADproject\prototype\data\store.json) is being updated after actions.

## 14. Summary

This prototype is a simple but richer demonstration of the Spotify-Like Music Streaming System. It shows a more realistic localized interface, a stronger Ethiopian music identity, and a clear interaction flow between user interface, backend API, and persistent data storage.
