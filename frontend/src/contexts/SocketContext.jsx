// contexts/SocketContext.js
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import socketService from "../services/socket";

export const SocketContext = createContext();

const gameEndingOptions = {
  autoClose: false,
  draggable: false,
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [changesVector, setChangesVector] = useState(null);
  const [gameWinner, setGameWinner] = useState(false);

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
      gameWinner
        ? toast.info("Opponent left the game", gameEndingOptions)
        : toast.success("You won! Opponent left", gameEndingOptions);
      // console.log("You won!!! Opponent left");
      // setGameState(prev => ({...prev, status: "victory"}));
    };

    const handleOpponentFound = (gid, gameData) => {
      toast.success("Opponent found! The game begins now");
      // console.log("Opponent found! Game ID:", gid);
      setGameState(gameData);
      setGameId(gid);
    };

    const handleUpdate = (gameData, changes, extraData) => {
      setGameState(gameData);
      setChangesVector(changes);
      if(extraData.newTurn){
        switch(Number(extraData.newTurn)){
          case 13:
            toast.info("Sudden death! Each player gets 15pts per turn from now on!");
            break;
          case 15:
            toast.info("The last turn! If no-one wins, there is going to be a draw");
            break;
          default:
            toast.info(`Turn ${extraData.newTurn} has just began`);
        }
      }
      // think if there can be an else if or not, cause someone may win between the turns (with more complicated cards in the future)
      if (extraData.winner) {
        extraData.winner === socket.id
          ? toast.success("Fantastic, you won!", gameEndingOptions)
          : toast.error("Enemy has won...", gameEndingOptions);
        setGameWinner(true);
      }
    };

    const handlePassed = (newData, changes, whoPassed) => {
      setGameState((prev) => {
        const enemyId = Object.keys(prev.players).find(
          (id) => id !== socket.id
        );
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
      if(whoPassed){
        toast.info("Enemy has just passed")
      }
    };

    const handleDraw = () => {
      toast.info("It's a draw! The game ended!", gameEndingOptions);
      setGameWinner(true);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("error", handleError);
    socket.on("opponentLeft", handleOpponentLeft);
    socket.on("opponentFound", handleOpponentFound);
    socket.on("update", handleUpdate);
    socket.on("passedTurn", handlePassed);
    socket.on("draw", handleDraw);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("error", handleError);
      socket.off("opponentLeft", handleOpponentLeft);
      socket.off("opponentFound", handleOpponentFound);
      socket.off("update", handleUpdate);
      socket.off("passedTurn", handlePassed);
      socket.off("draw", handleDraw);
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
    gameWinner,
    findOpponent,
    playCard,
    makeAttack,
    passTurn,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
