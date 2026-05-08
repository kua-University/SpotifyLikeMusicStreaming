class WebBffService {
  constructor({ repository, catalogService, playlistService, recommendationService, recommendationBreaker }) {
    this.repository = repository;
    this.catalogService = catalogService;
    this.playlistService = playlistService;
    this.recommendationService = recommendationService;
    this.recommendationBreaker = recommendationBreaker;
  }

  buildHomePayload() {
    const store = this.repository.read();
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

  async buildWebHome() {
    const [songs, playlists, activity, home, recommendations] = await Promise.all([
      Promise.resolve(this.catalogService.search()),
      Promise.resolve(this.playlistService.list()),
      Promise.resolve(this.repository.read().activity.slice().reverse()),
      Promise.resolve(this.buildHomePayload()),
      this.recommendationBreaker.execute(
        () => Promise.resolve(this.recommendationService.list()),
        () => Promise.resolve([])
      )
    ]);

    return {
      songs,
      playlists,
      activity,
      home,
      recommendations,
      client: "web"
    };
  }
}

module.exports = { WebBffService };
