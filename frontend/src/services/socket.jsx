import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    // this.isInGame = false;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(
        window.location.hostname === "localhost"
          ? "http://localhost:8080"
          : window.location.origin,
        {
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
        }
      );
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketService();
