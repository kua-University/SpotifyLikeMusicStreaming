class AnalyticsService {
  constructor(repository) {
    this.repository = repository;
    this.observedEvents = [];
  }

  listActivity() {
    return this.repository.read().activity.slice().reverse();
  }

  recordPlayback(event) {
    this.observedEvents.push({
      consumer: "analytics-service",
      eventType: event.type,
      songId: event.songId,
      observedAt: new Date().toISOString()
    });
  }

  recordPlaylistChange(event) {
    this.observedEvents.push({
      consumer: "analytics-service",
      eventType: event.type,
      playlistId: event.playlistId,
      observedAt: new Date().toISOString()
    });
  }
}

module.exports = { AnalyticsService };
