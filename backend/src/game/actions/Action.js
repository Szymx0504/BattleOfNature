class Action {
  constructor() {
    if (new.target === Action) {
      throw new TypeError("Cannot construct Action instances directly");
    }
  }

  // To be implemented by subclasses
  execute(game) {
    throw new Error("Must override execute method");
  }
}

module.exports = Action;
