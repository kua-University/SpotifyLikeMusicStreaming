const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");

const existingSession = localStorage.getItem("spotify_like_session");
if (existingSession) {
  window.location.href = "/home.html";
}

async function loginRequest(payload) {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({ error: "Login failed" }));
  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }
  return data;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const session = await loginRequest({ username, password });
    localStorage.setItem("spotify_like_session", JSON.stringify(session));
    loginStatus.textContent = "Login successful. Opening home page...";
    window.location.href = "/home.html";
  } catch (error) {
    loginStatus.textContent = error.message;
  }
});
