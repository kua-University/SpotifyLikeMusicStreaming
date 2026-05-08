const path = require("path");
const { MEDIA_DIR } = require("../config/paths");

class StreamingService {
  constructor(repository) {
    this.repository = repository;
  }

  getStream(songId) {
    const store = this.repository.read();
    const song = store.songs.find((item) => item.id === songId);

    if (!song || !song.audioFile) {
      const error = new Error("Audio stream not found");
      error.status = 404;
      error.publicMessage = "Audio stream not found";
      throw error;
    }

    const filePath = path.join(MEDIA_DIR, song.audioFile);
    if (!filePath.startsWith(MEDIA_DIR)) {
      const error = new Error("Invalid audio path");
      error.status = 400;
      error.publicMessage = "Invalid audio path";
      throw error;
    }

    return {
      filePath,
      mimeType: song.mimeType || "audio/wav",
      song
    };
  }
}

module.exports = { StreamingService };
