class AuthService {
  constructor(repository) {
    this.repository = repository;
    this.validUsers = [
      { username: "merkeb", password: "1234" },
      { username: "admin", password: "1234" }
    ];
  }

  login({ username, password }) {
    const normalizedUsername = String(username || "").trim().toLowerCase();
    const normalizedPassword = String(password || "").trim();
    const matched = this.validUsers.find((user) =>
      user.username === normalizedUsername && user.password === normalizedPassword
    );

    if (!matched) {
      const error = new Error("Invalid username or password");
      error.status = 401;
      error.publicMessage = "Invalid username or password";
      throw error;
    }

    const store = this.repository.read();
    return {
      user: {
        id: store.user.id,
        name: store.user.name,
        plan: store.user.plan
      },
      token: "demo-session-token"
    };
  }
}

module.exports = { AuthService };
