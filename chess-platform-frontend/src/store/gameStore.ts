import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";
import { useTimerStore } from "./timerStore";
import { Chess } from 'chess.js';  

export const useGameStore = defineStore("game", () => {
  const timerStore = useTimerStore();

  type GameReason = 
  | "checkMate"
  | "stalemate"
  | "50-move-rule" 
  | "threefold-repetition"
  | "insufficient-material"
  | "timeOut"
  | "give-up"
  | "no_move"
  | "agreed-draw";

  type GameType = 
  | "draw"
  | "blackWin"
  | "whiteWin"
  | "canceledGame"

  interface GameResult {
    type: GameType | null;
    reason: GameReason | null;
  }

  const chess = ref(new Chess());

  /**
   * Расположение фигур на доске (теперь синхронизируется с chess.js)
   */
  const pieces = ref<object>({});
  /**
   * Очередь хода ("w" или "b")
   */
  const currentTurn = ref<"w" | "b" | null>("w");
  /**
   * Информация о последнем выполненном ходе.
   */
  const lastMove = ref({
    from: null,
    to: null,
  });
  /**
   * Результат партии. null - игра продолжается.
   */
  const result = ref<GameResult>({
    type: null,
    reason: null,
  });
  const gameStarted = ref<boolean>(false);
  /**
   * Текущий цвет игрока ("w" или "b")
   */
  const playerColor = ref<"w" | "b" | null>(null);
  /**
   * Цвет оппонента
   */
  const opponentColor = computed(() => (playerColor.value === "w" ? "b" : "w"));
  /**
   * Идентификатор текущей игровой комнаты
   */
  const currentRoomId = ref(null);
  const moveHistory = ref([]);

  const offerDraw = ref(false);
  const offerUndo = ref(false);

  const opponent = ref({
    id: null,
    username: "Opponent",
    blitzRating: 1200,
  });

  function setOpponent(data) {
    opponent.value = {
      id: data.id,
      username: data.username,
      blitzRating: data.blitz_rating ?? 1200,
    };
  }

  /**
   * Устанавливает цвет игрока
   * @param {"w"|"b"} color - Цвет фигур игрока
   */
  function setPlayerColor(color) {
    console.log("🎨 setPlayerColor:", color);
    playerColor.value = color;
  }

  /**
   * Устанавливает очередь хода
   * @param {"w"|"b"} turn - Чья очередь ходить
   */
  function setCurrentTurn(turn) {
    currentTurn.value = turn;
  }

  function resetBoard() {
    chess.value = new Chess();  
    parseFEN(chess.value.fen());  // Обновляем pieces
  }

  /**
   * Парсит FEN в pieces (для синхронизации с chess.js)
   */
  function parseFEN(fen) {
    const newPieces = {};
    const rows = fen.split(' ')[0].split('/');
    let rank = 8;
    for (const row of rows) {
      let fileIndex = 0;
      for (const char of row) {
        if (/\d/.test(char)) {
          fileIndex += parseInt(char);
        } else {
          const color = char === char.toUpperCase() ? 'w' : 'b';
          const type = char.toUpperCase();
          const square = ['a','b','c','d','e','f','g','h'][fileIndex] + rank;
          newPieces[square] = color + type;
          fileIndex++;
        }
      }
      rank--;
    }
    pieces.value = newPieces;
    currentTurn.value = chess.value.turn();  // Синхронизируем turn
  }

  /**
   * Выполняет ход через chess.js
   */
  function makeMove(from, to) {
    if (result.value.type) {
      console.warn("Game finished:", result.value.type);
      return false;
    }

    try {
      const move = chess.value.move({ from, to, promotion: 'q' });  // Авто-промоушен в ферзя (можно добавить выбор)
      if (!move) {
        console.warn(`🚫 Недопустимый ход: ${from} → ${to}`);
        return false;
      }

      parseFEN(chess.value.fen());

      moveHistory.value.push({
        from: move.from,
        to: move.to,
        piece: move.piece.toUpperCase(),  
        fen: chess.value.fen(),
        turn: move.color === 'w' ? 'b' : 'w',  
        san: move.san
      });

      lastMove.value = { from, to };

      checkGameState();

      return true;
    } catch (err) {
      console.error("Ошибка в chess.js move:", err);
      return false;
    }
  }

  /**
   * Проверяет текущее состояние игры через chess.js
   */
  function checkGameState() {
    if (chess.value.isCheckmate()) {
      const loserColor = chess.value.turn();
      const winner = loserColor === 'w' ? 'b' : 'w';
      result.value = { 
        type: winner === 'w' ? 'whiteWin' : 'blackWin', 
        reason: 'checkMate' 
      };
      endGame('checkMate', winner);
      return 'checkmate';
    }

    if (chess.value.isStalemate()) {
      result.value = { type: 'draw', reason: 'stalemate' };
      endGame('stalemate');
      return 'stalemate';
    }

    if (chess.value.isThreefoldRepetition()) {
      result.value = { type: 'draw', reason: 'threefold-repetition' };
      endGame('threefold-repetition');
      return 'threefold-repetition';
    }

    if (chess.value.isInsufficientMaterial()) {
      result.value = { type: 'draw', reason: 'insufficient-material' };
      endGame('insufficient-material');
      return 'insufficient-material';
    }

    if (chess.value.isDraw()) {  
      result.value = { type: 'draw', reason: '50-move-rule' };
      endGame('50-move-rule');
      return '50-move rule';
    }

    if (chess.value.inCheck()) {
      return 'check';
    }

    return null;
  }

  /**
   * Возвращает доступные ходы через chess.js
   */
  function getAvailableMoves(squareId) {
    const moves = new Set();
    const available = chess.value.moves({ square: squareId, verbose: true });
    for (const move of available) {
      moves.add(move.to);
    }
    return moves;
  }

  // --- WebSocket подключение --- //
  let ws = null;
  const playersCount = ref(0);
  const shouldRedirect = ref(null);

  /**
   * Подключается к серверу WebSocket и слушает события.
   * @param {string} roomId - ID комнаты (например "game123")
   */
  function connectToServer(roomId = "game123", color = null, name = "Player") {
    if (ws && ws.readyState === WebSocket.OPEN && ws.roomId === roomId) return;

    if (ws) {
      try {
        ws.close();
      } catch (e) {
        /* ignore */
      }
      ws = null;
    }

    ws = new WebSocket("ws://localhost:3000");
    ws.roomId = roomId;

    ws.onopen = () => {
      console.log("✅ WebSocket подключен (client)");
      console.log("🎨 Отправляю данные на сервер:", { roomId, color, name });
      ws.send(JSON.stringify({ type: "join", roomId, name, color }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 Сообщение от сервера:", data);

      switch (data.type) {
      case "joined":
        console.log("🎯 Игрок успешно присоединился:", data);
        setPlayerColor(data.color);
        currentRoomId.value = data.roomId;
        playersCount.value = data.playersCount;

        if (data.fen) {
          chess.value.load(data.fen); 
          parseFEN(data.fen);         
        } else {
          resetBoard();             
        }
        break;

        case "position":
          console.log("♟ Получена позиция от сервера:", data.fen);
          if (data.fen) {
            chess.value.load(data.fen);  
            parseFEN(data.fen);          
          }

          if (data.history) {
            moveHistory.value = data.history;
            if (data.history.length > 0) {  
              gameStarted.value = true;
              timerStore.cancelPreStart();
              timerStore.preSeconds = 0;
            }
          }

          if (data.turn) {
            currentTurn.value = data.turn;  
          }
          gameStarted.value = true;
          break;

        case "history":
          console.log("📜 Получена история ходов:", data.history);
          moveHistory.value = data.history;
          break;

        case "start_game":
          console.log("🚀 Игра начинается!", data);
          shouldRedirect.value = {
            roomId: data.roomId,
            reason: "game_started",
          };
          playersCount.value = 2;
          if (data.turn) setCurrentTurn(data.turn);
          break;

        case "player_joined":
          console.log("👤 В комнату вошёл игрок:", data);
          playersCount.value += 1;
          setOpponent(data.player);
          break;

        case "moveMade":
          if (result.value.type) return;
          console.log("♟ Подтверждён ход:", data.from, "→", data.to);

          if (timerStore.preSeconds > 0) {
            timerStore.cancelPreStart();
          }

          makeMove(data.from, data.to); 
          if (data.turn) setCurrentTurn(data.turn);
          gameStarted.value = true;
          break;

        case "move":
          if (result.value.type) return;
          console.log("♟ Ход от другого игрока:", data.move);

          gameStarted.value = true;

          if (timerStore.preSeconds > 0) {
            timerStore.cancelPreStart();
          }

          makeMove(data.move.from, data.move.to);
          if (data.turn) setCurrentTurn(data.turn);
          break;

        case "error":
          console.warn("❌ Ошибка от сервера:", data.message);
          break;

        case "player_left":
          console.log("🚪 Игрок покинул комнату:", data);
          playersCount.value = Math.max(0, playersCount.value - 1);
          break;

        case "timerUpdate":
          if (timerStore) {
            timerStore.updateFromServer(data);
          }
          break;

        case "offer-draw":
          console.log("Поступило предложение ничьи")
          offerDraw.value = true;
          break;

        case "offer-undo":  
          console.log("Поступило предложение undo");
          offerUndo.value = true;
          break;

        case "undo-accepted":  
          console.log("Undo принято оппонентом");
          break;

        case "preStartUpdate":
          console.log("⏳ Обновление претаймера:", data);
          gameStarted.value = data.gameStarted;
          if (timerStore) {
            timerStore.preSeconds = data.preStartTime;
          }
          break;

        case "gameOver":
          console.log("🏁 Конец игры:", data);
          if (data.reason === "timeOut") {
            result.value = {
              type: data.winner === "w" ? "whiteWin" : "blackWin",
              reason: "timeOut"
            };
          } else if (data.reason === "no_first_move") {
            result.value = {
              type: "canceledGame",
              reason: "no_move"
            };
          } else if (data.reason === "give-up") {
            result.value = {
              type: data.winner === "w" ? "whiteWin" : "blackWin",
              reason: "give-up"
            };
          }
          break;

        default:
          console.warn("⚙️ Неизвестный тип сообщения:", data.type);
      }
    };

    ws.onclose = () => {
      console.log("❌ WebSocket закрыт");
      ws = null;
    };

    ws.onerror = (err) => {
      console.error("⚠️ Ошибка WebSocket:", err);
    };
  }

  /**
   * Отправляет ход на сервер.
   */
  function sendMove(from, to) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const moveData = {
        type: "make_move",
        roomId: currentRoomId.value,
        move: { from, to, fen: chess.value.fen(), san: chess.value.history({ verbose: true }).pop()?.san || '' },
      };
      ws.send(JSON.stringify(moveData));
      console.log("📤 Отправил на сервер ход:", moveData);
    } else {
      console.warn("⚠️ Невозможно отправить ход — WebSocket не подключён");
    }
  }

  function disconnect() {
    if (!ws) return;
    try {
      ws.close();
    } catch (e) {
      /* ignore */
    }
    ws = null;
  }

  /**
   * Завершает игру и отправляет сообщение на сервре
   */
  function endGame(reason: GameReason, winner: "w" | "b" | null = null) {
    if (reason === "checkMate") {
      result.value = {
        type: winner === "w" ? "whiteWin" : "blackWin",
        reason: "checkMate",
      };
    } else if (["stalemate", "50-move-rule", "threefold-repetition", "insufficient-material", "agreed-draw"].includes(reason)) {
      result.value = { type: "draw", reason };
    } else if (reason === "timeOut") {
      result.value = {
        type: winner === "w" ? "whiteWin" : "blackWin",
        reason: "timeOut",
      };
    } else if (reason === "give-up") {
      result.value = {
        type: winner === "w" ? "whiteWin" : "blackWin",
        reason: "give-up",
      };
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: "game_over",
        roomId: currentRoomId.value,
        reason,
        winner, 
      }));
    }

    console.log("Игра окончена:", reason, winner ? `победитель ${winner}` : "ничья");
  }

  function sendToServer(msessage, color: "w" | 'b' = null) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: msessage,
        roomId: currentRoomId.value,
      }));
    }
  }

function acceptUndo() {
  offerUndo.value = false;
  
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: "accept-undo",
      roomId: currentRoomId.value,
    }));
    console.log("📤 Отправил accept-undo на сервер");
  } else {
    console.error("WebSocket не подключен");
  }
};

  function rejectUndo() {
    offerUndo.value = false;
  };

  return {
    pieces,
    currentTurn,
    lastMove,
    result,
    opponentColor,
    playersCount,
    shouldRedirect,
    playerColor,
    opponent,
    gameStarted,
    moveHistory,
    offerDraw,
    offerUndo,
    setInitialPosition: resetBoard,  
    makeMove,
    checkGameState,
    getAvailableMoves,
    connectToServer,
    sendMove,
    disconnect,
    setPlayerColor,
    setOpponent,
    endGame,
    sendToServer,
    acceptUndo,  
    rejectUndo, 
  };
});