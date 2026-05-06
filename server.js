const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_FILE = path.join(__dirname, "data", "store.json");

function readStore() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeStore(store) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8"
  };

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream"
    });
    res.end(content);
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function notFound(res) {
  sendJson(res, 404, { error: "Resource not found" });
}

function buildHomePayload(store) {
  const songMap = new Map(store.songs.map((song) => [song.id, song]));
  const favoriteSongs = store.user.favorites
    .map((id) => songMap.get(id))
    .filter(Boolean);
  const recentlyPlayed = store.activity
    .filter((entry) => entry.type === "song_played")
    .slice()
    .reverse()
    .slice(0, 5)
    .map((entry) => ({
      ...entry,
      song: songMap.get(entry.songId)
    }));
  const trendingSongs = store.songs
    .slice()
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 4);

  return {
    user: store.user,
    stats: {
      songs: store.songs.length,
      playlists: store.playlists.length,
      favorites: store.user.favorites.length
    },
    featuredPlaylists: store.playlists.slice(0, 3),
    favoriteSongs,
    trendingSongs,
    recentlyPlayed
  };
}

function buildRecommendations(store) {
  const favoriteIds = new Set(store.user.favorites);
  const favoriteGenres = store.songs
    .filter((song) => favoriteIds.has(song.id))
    .map((song) => song.genre);
  const topGenre = favoriteGenres[0];

  return store.songs
    .filter((song) => !favoriteIds.has(song.id))
    .sort((a, b) => {
      const aBoost = a.genre === topGenre ? 1 : 0;
      const bBoost = b.genre === topGenre ? 1 : 0;
      return bBoost - aBoost || b.playCount - a.playCount;
    })
    .slice(0, 4);
}

function buildSessionPayload(store) {
  return {
    user: {
      id: store.user.id,
      name: store.user.name,
      plan: store.user.plan
    },
    token: "demo-session-token"
  };
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = reqUrl.pathname;

  if (req.method === "POST" && pathname === "/api/login") {
    try {
      const body = await parseBody(req);
      const username = String(body.username || "").trim().toLowerCase();
      const password = String(body.password || "").trim();
      const store = readStore();

      const validUsers = [
        { username: "merkeb", password: "1234" },
        { username: "admin", password: "1234" }
      ];

      const matched = validUsers.find((item) => item.username === username && item.password === password);
      if (!matched) {
        sendJson(res, 401, { error: "Invalid username or password" });
        return;
      }

      sendJson(res, 200, buildSessionPayload(store));
    } catch (error) {
      sendJson(res, 400, { error: "Invalid JSON body" });
    }
    return;
  }

  if (req.method === "GET" && pathname === "/api/songs") {
    const store = readStore();
    const query = reqUrl.searchParams.get("q");
    const genre = reqUrl.searchParams.get("genre");
    let results = store.songs.slice();

    if (query) {
      const normalized = query.toLowerCase();
      results = results.filter((song) =>
        [song.title, song.artist, song.album, song.genre, song.mood]
          .join(" ")
          .toLowerCase()
          .includes(normalized)
      );
    }

    if (genre) {
      results = results.filter((song) => song.genre.toLowerCase() === genre.toLowerCase());
    }

    sendJson(res, 200, results);
    return;
  }

  if (req.method === "GET" && pathname === "/api/home") {
    const store = readStore();
    sendJson(res, 200, buildHomePayload(store));
    return;
  }

  if (req.method === "GET" && pathname === "/api/recommendations") {
    const store = readStore();
    sendJson(res, 200, buildRecommendations(store));
    return;
  }

  if (req.method === "GET" && pathname === "/api/playlists") {
    const store = readStore();
    sendJson(res, 200, store.playlists);
    return;
  }

  if (req.method === "POST" && pathname === "/api/playlists") {
    try {
      const body = await parseBody(req);
      const name = String(body.name || "").trim();
      if (!name) {
        sendJson(res, 400, { error: "Playlist name is required" });
        return;
      }

      const store = readStore();
      const playlist = {
        id: `pl-${Date.now()}`,
        name,
        description: "Custom playlist created in the prototype.",
        theme: "Personal mix",
        songs: []
      };
      store.playlists.push(playlist);
      writeStore(store);
      sendJson(res, 201, playlist);
    } catch (error) {
      sendJson(res, 400, { error: "Invalid JSON body" });
    }
    return;
  }

  if (req.method === "POST" && pathname.startsWith("/api/playlists/") && pathname.endsWith("/songs")) {
    try {
      const body = await parseBody(req);
      const songId = String(body.songId || "").trim();
      const playlistId = pathname.split("/")[3];
      const store = readStore();
      const playlist = store.playlists.find((item) => item.id === playlistId);
      const song = store.songs.find((item) => item.id === songId);

      if (!playlist || !song) {
        notFound(res);
        return;
      }

      if (!playlist.songs.includes(songId)) {
        playlist.songs.push(songId);
        writeStore(store);
      }

      sendJson(res, 200, playlist);
    } catch (error) {
      sendJson(res, 400, { error: "Invalid JSON body" });
    }
    return;
  }

  if (req.method === "POST" && pathname.startsWith("/api/favorites/")) {
    const songId = pathname.split("/")[3];
    const store = readStore();
    const song = store.songs.find((item) => item.id === songId);

    if (!song) {
      notFound(res);
      return;
    }

    const favorites = new Set(store.user.favorites);
    let action = "favorite_added";

    if (favorites.has(songId)) {
      favorites.delete(songId);
      action = "favorite_removed";
    } else {
      favorites.add(songId);
    }

    store.user.favorites = Array.from(favorites);
    store.activity.push({
      id: `ev-${Date.now()}`,
      type: action,
      songId,
      playedAt: new Date().toISOString()
    });
    writeStore(store);

    sendJson(res, 200, {
      action,
      favorites: store.user.favorites
    });
    return;
  }

  if (req.method === "POST" && pathname.startsWith("/api/play/")) {
    const songId = pathname.split("/")[3];
    const store = readStore();
    const song = store.songs.find((item) => item.id === songId);
    if (!song) {
      notFound(res);
      return;
    }

    song.playCount += 1;
    store.activity.push({
      id: `ev-${Date.now()}`,
      type: "song_played",
      songId,
      playedAt: new Date().toISOString()
    });
    writeStore(store);

    sendJson(res, 200, {
      message: `Now playing ${song.title}`,
      song,
      home: buildHomePayload(store)
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/activity") {
    const store = readStore();
    sendJson(res, 200, store.activity.slice().reverse());
    return;
  }

  const requestedFile = pathname === "/" ? "login.html" : pathname.slice(1);
  const filePath = path.join(PUBLIC_DIR, requestedFile);

  if (filePath.startsWith(PUBLIC_DIR)) {
    sendFile(res, filePath);
    return;
  }

  notFound(res);
});

server.listen(PORT, () => {
  console.log(`Prototype running at http://localhost:${PORT}`);
});
