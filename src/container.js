const { DATA_FILE } = require("./config/paths");
const { JsonStoreRepository } = require("./repositories/jsonStoreRepository");
const { createEventBus } = require("./events/eventBus");
const { createEventConsumers } = require("./events/eventConsumers");
const { createRecommendationStrategy } = require("./factories/recommendationStrategyFactory");
const { createStreamHandler } = require("./factories/streamHandlerFactory");
const { createCircuitBreaker } = require("./infrastructure/circuitBreaker");
const { AuthService } = require("./services/authService");
const { CatalogService } = require("./services/catalogService");
const { PlaylistService } = require("./services/playlistService");
const { PlaybackService } = require("./services/playbackService");
const { RecommendationService } = require("./services/recommendationService");
const { AnalyticsService } = require("./services/analyticsService");
const { ArchitectureService } = require("./services/architectureService");
const { WebBffService } = require("./services/webBffService");
const { StreamingService } = require("./services/streamingService");

function createContainer() {
  const repository = new JsonStoreRepository(DATA_FILE);
  const eventBus = createEventBus();
  const streamHandler = createStreamHandler(process.env.STREAM_PROVIDER || "cdn");
  const recommendationStrategy = createRecommendationStrategy(process.env.RECOMMENDATION_STRATEGY || "genre");

  const authService = new AuthService(repository);
  const catalogService = new CatalogService(repository);
  const analyticsService = new AnalyticsService(repository);
  const playlistService = new PlaylistService(repository, eventBus);
  const playbackService = new PlaybackService(repository, eventBus, streamHandler);
  const streamingService = new StreamingService(repository);
  const recommendationService = new RecommendationService(repository, recommendationStrategy);
  const recommendationBreaker = createCircuitBreaker({
    name: "recommendation-service",
    failureThreshold: 2,
    resetAfterMs: 5000
  });

  createEventConsumers(eventBus, {
    analyticsService,
    recommendationService
  });

  const webBffService = new WebBffService({
    repository,
    catalogService,
    playlistService,
    recommendationService,
    recommendationBreaker
  });

  return {
    repository,
    eventBus,
    authService,
    catalogService,
    playlistService,
    playbackService,
    streamingService,
    recommendationService,
    analyticsService,
    architectureService: new ArchitectureService(),
    webBffService
  };
}

module.exports = { createContainer };
