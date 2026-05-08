class RecommendationService {
  constructor(repository, strategy) {
    this.repository = repository;
    this.strategy = strategy;
    this.pendingRefreshSongIds = new Set();
  }

  list() {
    return this.strategy.recommend(this.repository.read());
  }

  markRefreshRequested(songId) {
    this.pendingRefreshSongIds.add(songId);
  }

  getRefreshQueue() {
    return Array.from(this.pendingRefreshSongIds);
  }
}

module.exports = { RecommendationService };
