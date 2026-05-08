function createStreamHandler(provider) {
  if (provider === "local") {
    return {
      prepare(song) {
        return {
          provider: "local-object-storage",
          mediaUrl: `/api/stream/${song.id}`
        };
      }
    };
  }

  return {
    prepare(song) {
      return {
        provider: "local-cdn",
        mediaUrl: `/api/stream/${song.id}`
      };
    }
  };
}

module.exports = { createStreamHandler };
