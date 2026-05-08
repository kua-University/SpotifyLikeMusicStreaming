function createGenreStrategy() {
  return {
    recommend(store) {
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
  };
}

function createTrendingStrategy() {
  return {
    recommend(store) {
      const favoriteIds = new Set(store.user.favorites);
      return store.songs
        .filter((song) => !favoriteIds.has(song.id))
        .sort((a, b) => b.playCount - a.playCount)
        .slice(0, 4);
    }
  };
}

function createRecommendationStrategy(type) {
  if (type === "trending") {
    return createTrendingStrategy();
  }
  return createGenreStrategy();
}

module.exports = { createRecommendationStrategy };
