function ok(payload) {
  return { status: 200, payload };
}

function created(payload) {
  return { status: 201, payload };
}

function createApiGateway(container) {
  return {
    async handle(request) {
      const { method, pathname, searchParams } = request;

      if (!pathname.startsWith("/api/")) {
        return null;
      }

      if (method === "GET" && pathname === "/api/health") {
        return ok({
          status: "ok",
          service: "spotify-like-prototype"
        });
      }

      if (method === "GET" && pathname.startsWith("/api/stream/")) {
        return {
          status: 200,
          stream: container.streamingService.getStream(pathname.split("/")[3])
        };
      }

      if (method === "POST" && pathname === "/api/login") {
        return ok(container.authService.login(await request.body()));
      }

      if (method === "GET" && pathname === "/api/songs") {
        return ok(container.catalogService.search({
          query: searchParams.get("q"),
          genre: searchParams.get("genre")
        }));
      }

      if (method === "GET" && pathname === "/api/home") {
        return ok(container.webBffService.buildHomePayload());
      }

      if (method === "GET" && pathname === "/api/bff/web-home") {
        return ok(await container.webBffService.buildWebHome());
      }

      if (method === "GET" && pathname === "/api/recommendations") {
        return ok(container.recommendationService.list());
      }

      if (method === "GET" && pathname === "/api/playlists") {
        return ok(container.playlistService.list());
      }

      if (method === "POST" && pathname === "/api/playlists") {
        return created(container.playlistService.create(await request.body()));
      }

      if (method === "POST" && pathname.startsWith("/api/playlists/") && pathname.endsWith("/songs")) {
        return ok(container.playlistService.addSong({
          playlistId: pathname.split("/")[3],
          songId: String((await request.body()).songId || "").trim()
        }));
      }

      if (method === "POST" && pathname.startsWith("/api/favorites/")) {
        return ok(container.playbackService.toggleFavorite(pathname.split("/")[3]));
      }

      if (method === "POST" && pathname.startsWith("/api/play/")) {
        const playResult = container.playbackService.play(pathname.split("/")[3]);
        return ok({
          ...playResult,
          home: container.webBffService.buildHomePayload()
        });
      }

      if (method === "GET" && pathname === "/api/activity") {
        return ok(container.analyticsService.listActivity());
      }

      if (method === "GET" && pathname === "/api/architecture") {
        return ok(container.architectureService.describe());
      }

      const error = new Error("Resource not found");
      error.status = 404;
      error.publicMessage = "Resource not found";
      throw error;
    }
  };
}

module.exports = { createApiGateway };
