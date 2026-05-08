function createEventBus() {
  const subscribers = new Map();

  return {
    subscribe(eventType, handler) {
      const handlers = subscribers.get(eventType) || [];
      handlers.push(handler);
      subscribers.set(eventType, handlers);
    },

    publish(event) {
      const handlers = subscribers.get(event.type) || [];
      handlers.forEach((handler) => handler(event));
    }
  };
}

module.exports = { createEventBus };
