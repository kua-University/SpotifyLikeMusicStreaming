function createEventConsumers(eventBus, { analyticsService, recommendationService }) {
  eventBus.subscribe("song_played", (event) => {
    analyticsService.recordPlayback(event);
    recommendationService.markRefreshRequested(event.songId);
  });

  eventBus.subscribe("playlist_updated", (event) => {
    analyticsService.recordPlaylistChange(event);
  });
}

module.exports = { createEventConsumers };
