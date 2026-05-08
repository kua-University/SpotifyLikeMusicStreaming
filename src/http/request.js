function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        error.status = 400;
        error.publicMessage = "Invalid JSON body";
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

module.exports = { parseBody };
