class PlaybackService {
  constructor(repository, eventBus, streamHandler) {
    this.repository = repository;
    this.eventBus = eventBus;
    this.streamHandler = streamHandler;
  }

  play(songId) {
    const eventId = `ev-${Date.now()}`;
    const playedAt = new Date().toISOString();
    const result = this.repository.update((store) => {
      const song = store.songs.find((item) => item.id === songId);
      if (!song) {
        const error = new Error("Resource not found");
        error.status = 404;
        error.publicMessage = "Resource not found";
        throw error;
      }

      song.playCount += 1;
      store.activity.push({
        id: eventId,
        type: "song_played",
        songId,
        playedAt
      });

      return {
        message: `Now playing ${song.title}`,
        song,
        stream: this.streamHandler.prepare(song)
      };
    });

    this.eventBus.publish({
      type: "song_played",
      id: eventId,
      songId,
      playedAt
    });

    return result;
  }

  toggleFavorite(songId) {
    const result = this.repository.update((store) => {
      const song = store.songs.find((item) => item.id === songId);
      if (!song) {
        const error = new Error("Resource not found");
        error.status = 404;
        error.publicMessage = "Resource not found";
        throw error;
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

      return {
        action,
        favorites: store.user.favorites
      };
    });

    this.eventBus.publish({
      type: result.action,
      songId,
      occurredAt: new Date().toISOString()
    });

    return result;
  }
}

module.exports = { PlaybackService };
