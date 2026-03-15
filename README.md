# Battle of Nature

Battle of Nature is a strategic, turn-based card game centered on ecological combat. Players command various botanical units and spells to defend their grove and eliminate their opponent's Main Tree.

## Core Mechanics

The game operates on a turn-based system with real-time synchronization.

### Objective
The primary goal is to deplete the health of the opponent's Main Tree (starting at 25 HP). Matches are limited to 15 rounds; if no Main Tree is destroyed within this limit, the game ends in a draw.

### Resource Management
Players use **Nature Points (PTS)** to perform actions. 
- **Inception:** Both players start with 5 Nature Points and 5 cards.
- **Influx:** At the start of each round, players receive 10 PTS (increasing to 15 PTS from Round 13 onwards).
- **Decay:** Unused Nature Points do not carry over and are cleared at the end of each round.

### Gameplay Flow
- **Entry Phase:** Initial setup and determines the starting player.
- **Action Phase:** Players alternate taking single actions (Building objects, Attacking, or Using Spells).
- **Hand Dynamics:** The hand is refilled to 5 cards at the start of each round. No cards are drawn during the Action Phase.
- **Summoning Sickness:** Newly placed objects cannot attack until the subsequent round.

---

## Technical Architecture

The project is built with a decoupled client-server architecture, utilizing WebSockets for low-latency state synchronization.

### Backend (Node.js & Express)
Located in the `/backend` directory, the server manages game state, validates player actions, and broadcasts updates.

- **Game Logic:** Encapsulated in `/src/game`. It uses an Object-Oriented approach to define tiles, cards, and game states.
- **GameAPI:** A centralized interface for validating and executing game moves (playing cards, attacking, passing).
- **Action Queue:** Implements a sequential processing system to handle complex chain reactions and delayed effects (e.g., continuous spells).
- **Communication:** Powered by **Socket.io** to provide real-time updates to all connected clients.

### Frontend (React & Vite)
Located in the `/frontend` directory, the client provides a responsive and interactive interface for the game.

- **State Management:** Uses React Context API to manage the WebSocket connection and application-wide localization.
- **UI Components:** Built with modular CSS (CSS Modules) to ensure stylistic isolation.
- **Localization:** Supports multi-language interfaces (English and Polish) through a custom i18n context.
- **Real-time Synchronization:** Listens for backend socket events to reflect state changes immediately without manual polling.

---

## Installation and Setup

The project uses a unified dependency management strategy from the root directory.

1. **Install Dependencies:**
   Run the following command in the root folder to install all necessary packages for both frontend and backend:
   ```bash
   npm run install-all
   ```

2. **Run the Application:**
   Starts the backend server:
   ```bash
   npm start
   ```
   To run the frontend in development mode, navigate to the `/frontend` directory and use:
   ```bash
   npm run dev
   ```

3. **Production Build:**
   To build the frontend for production:
   ```bash
   npm run build
   ```
