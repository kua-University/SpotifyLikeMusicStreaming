function createCircuitBreaker({ name, failureThreshold = 3, resetAfterMs = 10000 }) {
  let failures = 0;
  let openedAt = 0;

  return {
    async execute(operation, fallback) {
      const now = Date.now();
      const isOpen = failures >= failureThreshold && now - openedAt < resetAfterMs;

      if (isOpen) {
        return fallback({ service: name, reason: "circuit_open" });
      }

      try {
        const result = await operation();
        failures = 0;
        openedAt = 0;
        return result;
      } catch (error) {
        failures += 1;
        openedAt = Date.now();
        return fallback({ service: name, reason: error.message });
      }
    }
  };
}

module.exports = { createCircuitBreaker };
