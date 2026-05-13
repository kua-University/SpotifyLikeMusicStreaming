const { spawn } = require("child_process");

const port = process.env.SMOKE_PORT || "3999";
const baseUrl = `http://127.0.0.1:${port}`;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(retries = 20) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        return;
      }
    } catch (error) {
      // Server is still starting.
    }
    await delay(300);
  }
  throw new Error("Health check did not become ready");
}

async function run() {
  const server = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: port
    },
    stdio: "inherit"
  });

  try {
    await waitForHealth();

    const bffResponse = await fetch(`${baseUrl}/api/bff/web-home`);
    if (!bffResponse.ok) {
      throw new Error(`BFF endpoint failed with ${bffResponse.status}`);
    }

    const bff = await bffResponse.json();
    if (!Array.isArray(bff.songs) || bff.songs.length < 1) {
      throw new Error("BFF response did not include songs");
    }

    const streamResponse = await fetch(`${baseUrl}/api/stream/song-1`, {
      headers: {
        Range: "bytes=0-127"
      }
    });
    if (streamResponse.status !== 206) {
      throw new Error(`Expected stream status 206, received ${streamResponse.status}`);
    }

    const contentRange = streamResponse.headers.get("content-range") || "";
    if (!contentRange.startsWith("bytes 0-127/")) {
      throw new Error(`Unexpected content-range header: ${contentRange}`);
    }

    console.log("Smoke test passed");
  } finally {
    server.kill();
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
