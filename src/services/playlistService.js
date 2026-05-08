class PlaylistService {
  constructor(repository, eventBus) {
    this.repository = repository;
    this.eventBus = eventBus;
  }

  list() {
    return this.repository.read().playlists;
  }

  create({ name }) {
    const playlistName = String(name || "").trim();
    if (!playlistName) {
      const error = new Error("Playlist name is required");
      error.status = 400;
      error.publicMessage = "Playlist name is required";
      throw error;
    }

    const playlist = this.repository.update((store) => {
      const nextPlaylist = {
        id: `pl-${Date.now()}`,
        name: playlistName,
        description: "Custom playlist created in the prototype.",
        theme: "Personal mix",
        songs: []
      };
      store.playlists.push(nextPlaylist);
      return nextPlaylist;
    });

    this.eventBus.publish({
      type: "playlist_updated",
      playlistId: playlist.id,
      action: "created",
      occurredAt: new Date().toISOString()
    });

    return playlist;
  }

  addSong({ playlistId, songId }) {
    const result = this.repository.update((store) => {
      const playlist = store.playlists.find((item) => item.id === playlistId);
      const song = store.songs.find((item) => item.id === songId);

      if (!playlist || !song) {
        const error = new Error("Resource not found");
        error.status = 404;
        error.publicMessage = "Resource not found";
        throw error;
      }

      if (!playlist.songs.includes(songId)) {
        playlist.songs.push(songId);
      }

      return playlist;
    });

    this.eventBus.publish({
      type: "playlist_updated",
      playlistId,
      songId,
      action: "song_added",
      occurredAt: new Date().toISOString()
    });

    return result;
  }
}

module.exports = { PlaylistService };
