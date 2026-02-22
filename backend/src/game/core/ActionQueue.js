class ActionQueue {
  constructor(game) {
    this.game = game;
    this.queue = [];
    this.history = []; // Serves as the changesVector for the frontend
    this.isProcessing = false;
  }

  enqueue(action) {
    this.queue.push(action);
  }

  addChange(change) {
    this.history.push(change);
  }

  process() {
    if (this.isProcessing) return; 
    this.isProcessing = true;
    
    try {
      while (this.queue.length > 0) {
        const action = this.queue.shift(); // Breadth-First: take the oldest action
        action.execute(this.game);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  getHistory() {
    return this.history;
  }

  clearHistory() {
    this.history = [];
  }
}

module.exports = ActionQueue;
