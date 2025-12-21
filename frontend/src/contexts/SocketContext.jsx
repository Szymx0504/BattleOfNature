// contexts/SocketContext.js
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import socketService from "../services/socket";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [changesVector, setChangesVector] = useState(null);

  useEffect(() => {
    const socket = socketService.connect();

    if (socket.connected) {
      setIsConnected(true);
      setSocketId(socket.id);
    }

    const handleConnect = () => {
      toast.info("Connected to the server");
      // console.log("Connected to server");
      setIsConnected(true);
      setSocketId(socket.id);
    };

    const handleDisconnect = (reason) => {
      toast.error(`Disconnected: ${reason}`);
      // console.log("Disconnected:", reason);
      setIsConnected(false);
      setSocketId(null);
    };

    const handleError = (reason) => {
      toast.error(`Error: ${reason}`);
      // console.log("Error:", reason);
      //     setError(errorMessage); // option for the future
      // // Auto-clear error after 5 seconds
      // setTimeout(() => setError(null), 5000);
    };

    const handleOpponentLeft = () => {
      toast.success("You won! Opponent left");
      // console.log("You won!!! Opponent left");
      // setGameState(prev => ({...prev, status: "victory"}));
    };

    const handleOpponentFound = (gid, gameData) => {
      toast.success("Opponent found! The game begins now");
      // console.log("Opponent found! Game ID:", gid);
      setGameState(gameData);
      setGameId(gid);
    };

    const handleUpdate = (gameData, changes) => {
      setGameState(gameData);
      setChangesVector(changes);
    };

    const handlePassed = (newData, changes) => {
      setGameState((prev) => {
        const enemyId = Object.keys(prev.players).find(id => id !== socket.id);
        return {
          ...prev,
          players: {
            [socket.id]: {
              ...prev.players[socket.id],
              passed: newData[socket.id],
            },
            [enemyId]: { ...prev.players[enemyId], passed: newData[enemyId] },
          },
          whoseMove: newData.whoseMove,
        };
      });
      setChangesVector(changes);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("error", handleError);
    socket.on("opponentLeft", handleOpponentLeft);
    socket.on("opponentFound", handleOpponentFound);
    socket.on("update", handleUpdate);
    socket.on("passedTurn", handlePassed);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("error", handleError);
      socket.off("opponentLeft", handleOpponentLeft);
      socket.off("opponentFound", handleOpponentFound);
      socket.off("update", handleUpdate);
      socket.off("passedTurn", handlePassed);
    };
  }, []);

  const findOpponent = (deck) => {
    const socket = socketService.connect();
    if (!socket) {
      console.error("Socket not ready");
      return;
    }
    socket.emit("findOpponent", deck);
  };

  const playCard = (card, tile) => {
    // tile = (row, col)
    const socket = socketService.connect();
    if (!socket) {
      console.error("Connection failure");
      return;
    }
    socket.emit("playCard", card, tile);
  };

  const makeAttack = (sourceCardInfo, targetCardInfo) => {
    const socket = socketService.connect();
    if (!socket) {
      console.error("Connection failure");
      return;
    }
    socket.emit("makeAttack", sourceCardInfo, targetCardInfo);
  };

  const passTurn = () => {
    const socket = socketService.connect();
    if (!socket) {
      console.error("Connection failure");
      return;
    }
    socket.emit("passTurn");
  };

  const value = {
    isConnected,
    gameState,
    gameId,
    socketId,
    changesVector,
    findOpponent,
    playCard,
    makeAttack,
    passTurn,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
