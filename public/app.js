const songsEl = document.getElementById("songs");
const playlistsEl = document.getElementById("playlists");
const activityEl = document.getElementById("activity");
const statusEl = document.getElementById("status");
const refreshBtn = document.getElementById("refreshBtn");
const playlistForm = document.getElementById("playlistForm");
const playlistNameInput = document.getElementById("playlistName");
const searchInput = document.getElementById("searchInput");
const statsEl = document.getElementById("stats");
const favoritesEl = document.getElementById("favorites");
const featuredEl = document.getElementById("featured");
const recentEl = document.getElementById("recent");
const recommendationsEl = document.getElementById("recommendations");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeText = document.getElementById("welcomeText");
const audioPlayer = document.getElementById("audioPlayer");
const playerTitle = document.getElementById("playerTitle");
const playerArtist = document.getElementById("playerArtist");
const playPauseBtn = document.getElementById("playPauseBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const queueListEl = document.getElementById("queueList");

const sessionRaw = localStorage.getItem("spotify_like_session");
if (!sessionRaw) {
  window.location.href = "/login.html";
}

let session = null;
try {
  session = JSON.parse(sessionRaw);
} catch (error) {
  localStorage.removeItem("spotify_like_session");
  window.location.href = "/login.html";
}

let songs = [];
let playlists = [];
let home = null;
let recommendations = [];
let searchTerm = "";
let queue = [];
let currentSong = null;
let currentQueueIndex = -1;

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

function formatActivity(entry) {
  const labels = {
    song_played: "Played",
    favorite_added: "Added to favorites",
    favorite_removed: "Removed from favorites"
  };
  return `${labels[entry.type] || entry.type} - ${new Date(entry.playedAt).toLocaleString()}`;
}

function filteredSongs() {
  if (!searchTerm) {
    return songs;
  }
  const normalized = searchTerm.toLowerCase();
  return songs.filter((song) =>
    [song.title, song.artist, song.album, song.genre, song.mood]
      .join(" ")
      .toLowerCase()
      .includes(normalized)
  );
}

function findSong(songId) {
  return songs.find((song) => song.id === songId);
}

function songCard(song, compact = false) {
  const favoriteIds = new Set(home?.user?.favorites || []);
  const isFavorite = favoriteIds.has(song.id);
  return `
    <article class="song-card ${compact ? "compact-card" : ""}">
      <div>
        <div class="meta-row">
          <span class="pill">${song.genre}</span>
          <span class="pill soft">${song.mood}</span>
        </div>
        <h3>${song.title}</h3>
        <p>${song.artist} - ${song.album}</p>
        <small>${song.duration} - ${song.playCount} plays</small>
      </div>
      <div class="actions">
        <button data-play="${song.id}">Play</button>
        <button class="secondary" data-queue="${song.id}">Queue</button>
        <button class="${isFavorite ? "secondary" : ""}" data-favorite="${song.id}">
          ${isFavorite ? "Unfavorite" : "Favorite"}
        </button>
        ${compact ? "" : `
          <select data-select-song="${song.id}">
            <option value="">Add to playlist</option>
            ${playlists.map((playlist) => `<option value="${playlist.id}">${playlist.name}</option>`).join("")}
          </select>
        `}
      </div>
    </article>
  `;
}

function renderQueue() {
  if (!queueListEl) {
    return;
  }

  queueListEl.innerHTML = queue.length
    ? queue.map((song, index) => `
      <button class="${index === currentQueueIndex ? "" : "secondary"}" data-queue-play="${index}" type="button">
        ${song.title} - ${song.artist}
      </button>
    `).join("")
    : "<span>No queued songs yet.</span>";
}

function updatePlayerState() {
  if (!currentSong) {
    playerTitle.textContent = "Choose a track";
    playerArtist.textContent = "Your queue is ready.";
    playPauseBtn.textContent = "Play";
    renderQueue();
    return;
  }

  playerTitle.textContent = currentSong.title;
  playerArtist.textContent = `${currentSong.artist} - ${currentSong.album}`;
  playPauseBtn.textContent = audioPlayer.paused ? "Play" : "Pause";
  renderQueue();
}

async function startSong(song, queueIndex = -1) {
  if (!song) {
    return;
  }

  const payload = await api(`/api/play/${song.id}`, { method: "POST" });
  currentSong = payload.song;
  currentQueueIndex = queueIndex;
  audioPlayer.src = payload.stream.mediaUrl;
  await audioPlayer.play();
  statusEl.textContent = payload.message;
  await loadAll();
  updatePlayerState();
}

function enqueueSong(song) {
  if (!song) {
    return;
  }

  queue.push(song);
  statusEl.textContent = `${song.title} added to queue.`;
  renderQueue();
}

async function playNext() {
  if (!queue.length) {
    return;
  }

  const nextIndex = currentQueueIndex + 1 < queue.length ? currentQueueIndex + 1 : 0;
  await startSong(queue[nextIndex], nextIndex);
}

async function playPrevious() {
  if (!queue.length) {
    return;
  }

  const previousIndex = currentQueueIndex > 0 ? currentQueueIndex - 1 : queue.length - 1;
  await startSong(queue[previousIndex], previousIndex);
}

function renderStats() {
  if (!home) {
    statsEl.innerHTML = "";
    return;
  }
  if (welcomeText && session?.user?.name) {
    welcomeText.textContent = `Signed in as ${session.user.name}`;
  }
  statsEl.innerHTML = `
    <article class="stat-card">
      <strong>${home.user.name}</strong>
      <span>${home.user.plan} listener</span>
    </article>
    <article class="stat-card">
      <strong>${home.stats.songs}</strong>
      <span>Playable tracks</span>
    </article>
    <article class="stat-card">
      <strong>${home.stats.playlists}</strong>
      <span>Playlists</span>
    </article>
    <article class="stat-card">
      <strong>${home.stats.favorites}</strong>
      <span>Favorites</span>
    </article>
  `;
}

function renderSongs() {
  const result = filteredSongs();
  songsEl.innerHTML = result.length
    ? result.map((song) => songCard(song)).join("")
    : "<p>No songs matched your search.</p>";
}

function renderPlaylists() {
  const songMap = new Map(songs.map((song) => [song.id, song]));
  playlistsEl.innerHTML = playlists.map((playlist) => `
    <article class="playlist-card">
      <div class="meta-row">
        <span class="pill">${playlist.theme || "Playlist"}</span>
      </div>
      <h3>${playlist.name}</h3>
      <p>${playlist.description || "Personal collection."}</p>
      <ul>
        ${playlist.songs.length
          ? playlist.songs.map((songId) => {
              const song = songMap.get(songId);
              return `<li>${song ? `${song.title} - ${song.artist}` : songId}</li>`;
            }).join("")
          : "<li>No songs added yet.</li>"}
      </ul>
    </article>
  `).join("");
}

function renderActivity(activity) {
  activityEl.innerHTML = activity.length
    ? activity.map((entry) => `<p>${formatActivity(entry)} - ${entry.songId}</p>`).join("")
    : "<p>No activity yet.</p>";
}

function renderHomePanels() {
  if (!home) {
    favoritesEl.innerHTML = "";
    featuredEl.innerHTML = "";
    recentEl.innerHTML = "";
    recommendationsEl.innerHTML = "";
    return;
  }

  favoritesEl.innerHTML = home.favoriteSongs.length
    ? home.favoriteSongs.map((song) => songCard(song, true)).join("")
    : "<p>No favorites yet.</p>";

  featuredEl.innerHTML = home.featuredPlaylists.map((playlist) => `
    <article class="playlist-card">
      <div class="meta-row">
        <span class="pill">${playlist.theme || "Featured"}</span>
      </div>
      <h3>${playlist.name}</h3>
      <p>${playlist.description || "Curated for the site."}</p>
      <small>${playlist.songs.length} songs</small>
    </article>
  `).join("");

  recentEl.innerHTML = home.recentlyPlayed.length
    ? home.recentlyPlayed.map((entry) => `
      <article class="activity-card">
        <strong>${entry.song ? entry.song.title : entry.songId}</strong>
        <p>${entry.song ? `${entry.song.artist} - ${entry.song.album}` : entry.songId}</p>
        <small>${formatActivity(entry)}</small>
      </article>
    `).join("")
    : "<p>No recent playback yet.</p>";

  recommendationsEl.innerHTML = recommendations.length
    ? recommendations.map((song) => songCard(song, true)).join("")
    : "<p>No recommendations available.</p>";
}

async function loadAll() {
  const webHome = await api("/api/bff/web-home");

  songs = webHome.songs;
  playlists = webHome.playlists;
  home = webHome.home;
  recommendations = webHome.recommendations;

  renderStats();
  renderSongs();
  renderPlaylists();
  renderActivity(webHome.activity);
  renderHomePanels();
  updatePlayerState();
}

async function handleCardClick(event) {
  const playButton = event.target.closest("[data-play]");
  const queueButton = event.target.closest("[data-queue]");
  const favoriteButton = event.target.closest("[data-favorite]");
  if (!playButton && !queueButton && !favoriteButton) {
    return;
  }

  try {
    if (playButton) {
      const song = findSong(playButton.dataset.play);
      if (song && !queue.some((queuedSong) => queuedSong.id === song.id)) {
        queue.push(song);
      }
      await startSong(song, queue.findIndex((queuedSong) => queuedSong.id === song.id));
      return;
    }
    if (queueButton) {
      enqueueSong(findSong(queueButton.dataset.queue));
    }
    if (favoriteButton) {
      const payload = await api(`/api/favorites/${favoriteButton.dataset.favorite}`, { method: "POST" });
      statusEl.textContent = payload.action === "favorite_added"
        ? "Song added to favorites."
        : "Song removed from favorites.";
    }
    await loadAll();
  } catch (error) {
    statusEl.textContent = error.message;
  }
}

songsEl.addEventListener("click", handleCardClick);
favoritesEl.addEventListener("click", handleCardClick);
recommendationsEl.addEventListener("click", handleCardClick);

songsEl.addEventListener("change", async (event) => {
  const select = event.target.closest("[data-select-song]");
  if (!select || !select.value) {
    return;
  }

  try {
    await api(`/api/playlists/${select.value}/songs`, {
      method: "POST",
      body: JSON.stringify({ songId: select.dataset.selectSong })
    });
    statusEl.textContent = "Song added to playlist.";
    select.value = "";
    await loadAll();
  } catch (error) {
    statusEl.textContent = error.message;
  }
});

playlistForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await api("/api/playlists", {
      method: "POST",
      body: JSON.stringify({ name: playlistNameInput.value })
    });
    playlistNameInput.value = "";
    statusEl.textContent = "Playlist created successfully.";
    await loadAll();
  } catch (error) {
    statusEl.textContent = error.message;
  }
});

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value.trim();
  renderSongs();
});

refreshBtn.addEventListener("click", loadAll);

playPauseBtn.addEventListener("click", async () => {
  try {
    if (!audioPlayer.src && queue.length) {
      await startSong(queue[0], 0);
      return;
    }

    if (audioPlayer.paused) {
      await audioPlayer.play();
    } else {
      audioPlayer.pause();
    }
    updatePlayerState();
  } catch (error) {
    statusEl.textContent = error.message;
  }
});

nextBtn.addEventListener("click", () => {
  playNext().catch((error) => {
    statusEl.textContent = error.message;
  });
});

prevBtn.addEventListener("click", () => {
  playPrevious().catch((error) => {
    statusEl.textContent = error.message;
  });
});

queueListEl.addEventListener("click", (event) => {
  const queueButton = event.target.closest("[data-queue-play]");
  if (!queueButton) {
    return;
  }

  const index = Number.parseInt(queueButton.dataset.queuePlay, 10);
  startSong(queue[index], index).catch((error) => {
    statusEl.textContent = error.message;
  });
});

audioPlayer.addEventListener("play", updatePlayerState);
audioPlayer.addEventListener("pause", updatePlayerState);
audioPlayer.addEventListener("ended", () => {
  playNext().catch((error) => {
    statusEl.textContent = error.message;
  });
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("spotify_like_session");
  window.location.href = "/login.html";
});

loadAll().catch((error) => {
  statusEl.textContent = error.message;
});
