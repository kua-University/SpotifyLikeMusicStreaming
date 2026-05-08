const fs = require("fs");
const path = require("path");
const { PUBLIC_DIR } = require("../config/paths");

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendStaticFile(res, pathname) {
  const requestedFile = pathname === "/" ? "login.html" : pathname.slice(1);
  const filePath = path.join(PUBLIC_DIR, requestedFile);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 404, { error: "Resource not found" });
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8"
  };

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream"
    });
    res.end(content);
  });
}

function sendAudioStream(req, res, filePath, mimeType = "audio/wav") {
  fs.stat(filePath, (err, stat) => {
    if (err) {
      sendJson(res, 404, { error: "Audio file not found" });
      return;
    }

    const range = req.headers.range;
    if (!range) {
      res.writeHead(200, {
        "Content-Type": mimeType,
        "Content-Length": stat.size,
        "Accept-Ranges": "bytes"
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    const [startText, endText] = range.replace(/bytes=/, "").split("-");
    const start = Number.parseInt(startText, 10);
    const end = endText ? Number.parseInt(endText, 10) : stat.size - 1;

    if (Number.isNaN(start) || Number.isNaN(end) || start >= stat.size || end >= stat.size) {
      res.writeHead(416, {
        "Content-Range": `bytes */${stat.size}`
      });
      res.end();
      return;
    }

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": mimeType
    });

    fs.createReadStream(filePath, { start, end }).pipe(res);
  });
}

module.exports = { sendJson, sendStaticFile, sendAudioStream };
