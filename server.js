const { createServer } = require("http");
const { URL } = require("url");

const { createContainer } = require("./src/container");
const { sendJson, sendStaticFile, sendAudioStream } = require("./src/http/responders");
const { parseBody } = require("./src/http/request");
const { createApiGateway } = require("./src/gateway/apiGateway");

const PORT = process.env.PORT || 3000;
const container = createContainer();
const gateway = createApiGateway(container);

const server = createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);

  try {
    const apiResult = await gateway.handle({
      method: req.method,
      pathname: reqUrl.pathname,
      searchParams: reqUrl.searchParams,
      headers: req.headers,
      body: () => parseBody(req)
    });

    if (apiResult) {
      if (apiResult.stream) {
        sendAudioStream(req, res, apiResult.stream.filePath, apiResult.stream.mimeType);
        return;
      }

      sendJson(res, apiResult.status, apiResult.payload);
      return;
    }

    sendStaticFile(res, reqUrl.pathname);
  } catch (error) {
    sendJson(res, error.status || 500, {
      error: error.publicMessage || "Unexpected server error"
    });
  }
});

server.listen(PORT, () => {
  console.log(`Prototype running at http://localhost:${PORT}`);
});
