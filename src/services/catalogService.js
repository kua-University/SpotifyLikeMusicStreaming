class CatalogService {
  constructor(repository) {
    this.repository = repository;
  }

  search({ query, genre } = {}) {
    const store = this.repository.read();
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

    return results;
  }

  findById(store, songId) {
    return store.songs.find((song) => song.id === songId);
  }
}

module.exports = { CatalogService };
