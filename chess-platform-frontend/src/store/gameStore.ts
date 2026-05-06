import { defineStore } from "pinia";
import { ref, watch, computed, shallowRef, markRaw } from "vue";
import { useTimerStore } from "./timerStore";
import { useUserStore } from "./userStore";
import { useSound } from "@/composables/utils/useSound";
import { Chess } from "chess.js";
import { useGames } from "@/composables/utils/useGames";

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

  type GameType = "draw" | "blackWin" | "whiteWin" | "canceledGame";

  interface GameResult {
    type: GameType | null;
    reason: GameReason | null;
  }

  const userStore = useUserStore();

  const chess = shallowRef(markRaw(new Chess()));
  const fen = ref(chess.value.fen());

  const { 
    playMove, 
    sixSeven, 
    captureMove, 
    checkMove,
    startSound,
    lowTimeSound,
    errorSound,
    berserkSound
  }  = useSound()

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
  /**
   * История всех ходов, выполненных в текущей партии.
   */
  const moveHistory = ref([]);
  /**
   * Флаг, указывающий на активное предложение ничьи от соперника.
   */
  const offerDraw = ref(false);
  /**
   * Текущий индекс просмотра партии (replay mode).
   *
   * - = moveHistory.length → нормальный режим (последняя позиция)
   * - < moveHistory.length → режим просмотра прошлых ходов
   */
  const currentReplayIndex = ref(-1);
  /**
   * Флаг, указывающий на активное предложение отменить последний ход от соперника.
   */
  const offerUndo = ref(false);
  /**
   * Объект, описывающий ожидающий ход превращения пешки.
   * Содержит информацию о ходе пешки, достигшей последней горизонтали,
   * для которого пользователь должен выбрать фигуру превращения.
   * null - если в данный момент нет ожидающего превращения.
   */
  const promotionMove = ref<{
    from: string;
    to: string;
    piece: string;
    pending: boolean;
  } | null>(null);

  /**
   * Флаг видимости модального окна выбора фигуры превращения.
   */
  const showPromotionModal = ref(false);
  /**
   * Информация об оппоненте.
   * Обновляется при подключении второго игрока.
   */
  const opponent = ref({
    id: null,
    username: "Opponent",
    blitzRating: 1200,
  });

  const whitePlayer = ref({
  username: "White",
  blitzRating: 1200,
});

  const blackPlayer = ref({
    username: "Black",
    blitzRating: 1200,
  });
  /**
   * Параметры создания / приглашения в игру.
   * Используются при подключении к серверу.
   */
  const inviteParams = ref({
    time: "3+0",
    mode: "friendly",
    color: "random",
  });

  watch(
    () => moveHistory.value.length,
    () => {
      currentReplayIndex.value = moveHistory.value.length;
    },
  );

  /**
   * Переключает доску на конкретный ход из истории.
   *
   * @param {number} index - индекс хода (0 = начальная позиция)
   *
   * Поведение:
   * - 0 → сброс доски
   * - n → загрузка FEN из moveHistory[n - 1]
   */
function goToMove(index: number) {
  if (index < 0) index = 0;
  if (index > moveHistory.value.length) {
      index = moveHistory.value.length;
      return;
  }

  currentReplayIndex.value = index;

  if (index === 0) {
    chess.value.reset();
    lastMove.value = { from: null, to: null };
    fen.value = chess.value.fen();
    currentTurn.value = chess.value.turn();
    return;                    
  }

  const targetMove = moveHistory.value[index - 1];

  if (targetMove.whiteTime !== undefined) {
    timerStore.whiteSeconds = targetMove.whiteTime;
  }

  if (targetMove.blackTime !== undefined) {
    timerStore.blackSeconds = targetMove.blackTime;
  }
  const targetFen = targetMove.fen;

  chess.value.load(targetFen);

  lastMove.value = {
    from: targetMove.from,
    to: targetMove.to,
  };

  fen.value = chess.value.fen();
  currentTurn.value = chess.value.turn();

 if (targetMove) {
    if (chess.value.inCheck()) {
      checkMove();
    } else if (targetMove.captured) {
      captureMove();
    } else {
      playMove();
    }
  }
}
  /**
   * Проверяет, находится ли пользователь в режиме просмотра партии.
   *
   * @returns {boolean}
   */
  function isReplayMode() {
    return currentReplayIndex.value < moveHistory.value.length;
  }
  /**
   * Устанавливает данные оппонента из сервера.
   *
   * @param {Object} data
   * @param {string|number} data.id
   * @param {string} data.username
   * @param {number} [data.blitz_rating]
   */
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
    console.log("setPlayerColor:", color);
    playerColor.value = color;
  }
  /**
   * Устанавливает очередь хода
   * @param {"w"|"b"} turn - Чья очередь ходить
   */
  function setCurrentTurn(turn) {
    currentTurn.value = turn;
  }

  /**
   * Полностью сбрасывает доску в начальное состояние.
   * Создаёт новый экземпляр chess.js.
   */
  function resetBoard() {
    chess.value = markRaw(new Chess());
    fen.value = chess.value.fen();
    currentTurn.value = chess.value.turn();
    lastMove.value = { from: null, to: null };
  }
  /**
   * Низкоуровневое применение хода через chess.js.
   *
   * Не обновляет состояние стора!
   * Используется как "чистая" операция без сайд-эффектов.
   *
   * @param {string} from
   * @param {string} to
   * @param {string} [promotion="q"]
   * @returns {object|null} объект хода или null если ход невалидный
   */
  function applyMove(from: string, to: string, promotion: string = "q") {
    try {
      const move = chess.value.move({ from, to, promotion });

      if (!move) return null;

      return move;
    } catch (e) {
      console.error("Ошибка chess.move:", e);
      return null;
    }
  }
  /**
   * Основная функция выполнения хода игрока.
   * 
   * Включает:
   * - проверку окончания игры
   * - обработку превращения пешки
   * - вызов applyMove
   * - обновление состояния
   * 
   * @returns {boolean} успешность выполнения хода
   */
  function makeMove(from, to, promotionPiece?: string) {
    if (result.value.type) {
      console.warn("Game finished");
      return false;
    }

    const piece = chess.value.get(from);

    const isPawn = piece && piece.type === "p";
    const isPromotionSquare =
      (to[1] === "8" && piece?.color === "w") ||
      (to[1] === "1" && piece?.color === "b");

    if (isPawn && isPromotionSquare && !promotionPiece) {
      promotionMove.value = {
        from,
        to,
        piece: piece.color + "p",
        pending: true,
      };
      showPromotionModal.value = true;
      return 'promotion'
    }

    const move = applyMove(from, to, promotionPiece);

    if (!move) {
      errorSound()
      console.warn(`Недопустимый ход: ${from} → ${to}`);
      return false;
    }

    if(move) {
      if(move.captured) {
        captureMove()
      } else {
        playMove()
      }
    }

    updateGameState(move);

    return true;
  }
  /**
   * Обновляет состояние стора после выполненного хода.
   * 
   * Включает:
   * - обновление истории
   * - lastMove
   * - fen
   * - currentTurn
   * - сброс promotion
   * - проверку состояния игры
   * 
   * @param {object} move - объект хода из chess.js
   */
  function updateGameState(move) {
    const newFen = chess.value.fen();

    moveHistory.value.push({
      from: move.from,
      to: move.to,
      piece: move.piece.toUpperCase(),
      fen: newFen,
      turn: move.color === "w" ? "b" : "w",
      san: move.san,
      promotedTo: move.promotion,


      whiteTime: timerStore.whiteSeconds,
      blackTime: timerStore.blackSeconds,
    });

    lastMove.value = {
      from: move.from,
      to: move.to,
    };

    fen.value = newFen;
    currentTurn.value = chess.value.turn();

    promotionMove.value = null;
    showPromotionModal.value = false;

    checkGameState();
  }
  /**
   * Завершает превращение пешки выбранной фигурой.
   * 
   * @param {string} promotionPiece
   * @returns {boolean}
   */
  function completePromotion(promotionPiece: string) {
    if (!promotionMove.value) return false;

    const { from, to } = promotionMove.value;

    const success = makeMove(from, to, promotionPiece);

    if (success) {
      if (currentRoomId.value) {
        sendMove(from, to, promotionPiece);
      }

      promotionMove.value = null;
      showPromotionModal.value = false;
    }

    return success;
  }
  /**
   * Отменяет процесс превращения пешки.
   */
  function cancelPromotion(): void {
    promotionMove.value = null;
    showPromotionModal.value = false;
  }
  /**
   * Проверяет текущее состояние игры через chess.js
   */
  function checkGameState() {
    if (chess.value.isCheckmate()) {
      const loserColor = chess.value.turn();
      const winner = loserColor === "w" ? "b" : "w";
      result.value = {
        type: winner === "w" ? "whiteWin" : "blackWin",
        reason: "checkMate",
      };

      startSound();
      return "checkmate";
    }

    if (chess.value.isStalemate()) {
      result.value = { type: "draw", reason: "stalemate" };

      startSound();
      return "stalemate";
    }

    if (chess.value.isThreefoldRepetition()) {
      result.value = { type: "draw", reason: "threefold-repetition" };
      startSound();
      return "threefold-repetition";
    }

    if (chess.value.isInsufficientMaterial()) {
      result.value = { type: "draw", reason: "insufficient-material" };
      startSound();
      return "insufficient-material";
    }

    if (chess.value.isDraw()) {
      result.value = { type: "draw", reason: "50-move-rule" };
      startSound();
      return "50-move rule";
    }

    if (chess.value.inCheck()) {
      checkMove()
      return "check";
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

  // --- WebSocket подключение 
  let ws = null;
  const playersCount = ref(0);
  const shouldRedirect = ref(null);

  /**
   * Подключается к серверу WebSocket и слушает события.
   * @param {string} roomId - ID комнаты (например "game123")
   */
  function connectToServer(
    roomId = "game123",
    color = null,
    name = "Player",
    time = "3+0",
  ) {
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
    const userId = userStore.userId;

    const usernameToSend =
      name && name.trim() !== ""
        ? name
        : userStore.username && userStore.username.trim() !== ""
          ? userStore.username
          : "Player";

    ws.onopen = () => {
      console.log("WebSocket подключен (client)");
      console.log("Отправляю данные на сервер:");

      const payload = {
        type: "join",
        roomId: roomId || "default",
        color: color || "random",
        name: usernameToSend || "Player",
        userId: userId || null,
        time: time,
      };

      console.log("Отправляю payload:", payload); // лог перед отправкой

      try {
        ws.send(JSON.stringify(payload));
      } catch (err) {
        console.error("Ошибка отправки:", err);
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 Сообщение от сервера:", data);

      switch (data.type) {
        case "joined":
          console.log("🎯 Игрок успешно присоединился:", data);

          currentRoomId.value = data.roomId;

          setPlayerColor(data.color);
          playersCount.value = data.playersCount;

          if (data.fen) {
            chess.value.load(data.fen);
            checkGameState();
          } else {
            resetBoard();
          }
          break;

        case "position":
          if (data.fen) {
            chess.value.load(data.fen);
            fen.value = chess.value.fen();
            currentTurn.value = data.turn ?? chess.value.turn();
            checkGameState();
          }

          if (data.history) {
            moveHistory.value = data.history;
            if (data.history.length > 0) {
              gameStarted.value = true;
              timerStore.cancelPreStart();
              timerStore.preSeconds = 0;
            }
          }

          gameStarted.value = true;
          break;

        case "history":
          moveHistory.value = data.history;
          break;

        case "start_game":
          gameStarted.value = true;
          startSound()

          shouldRedirect.value = {
            roomId: data.roomId,
            reason: "game_started",
          };
          playersCount.value = 2;
          if (data.turn) setCurrentTurn(data.turn);
          break;

        case "player_joined":
          playersCount.value += 1;
          setOpponent(data.player);
          break;

        case "moveMade":
          if (result.value.type) return;

          if (timerStore.preSeconds > 0) {
            timerStore.cancelPreStart();
          }

          gameStarted.value = true;
          break;

        case "move":
          if (result.value.type) return;

          gameStarted.value = true;

          if (timerStore.preSeconds > 0) {
            timerStore.cancelPreStart();
          }

          const move = applyMove(
            data.move.from,
            data.move.to,
            data.move.promotion,
          );

          if (move) {
            playMove();
            updateGameState(move);
          }
          break;

        case "error":
          console.warn("Ошибка от сервера:", data.message);
          break;

        case "player_left":
          playersCount.value = Math.max(0, playersCount.value - 1);
          break;

        case "timerUpdate":
          if (timerStore) {
            timerStore.updateFromServer(data);
          }
          break;

        case "offer-draw":
          console.log("Поступило предложение ничьи");
          offerDraw.value = true;
          break;

        case "offer-undo":
          console.log("Поступило предложение undo");
          offerUndo.value = true;
          break;

        case "undo-accepted":
          console.log("Undo принято оппонентом");

          if (moveHistory.value.length >= 1) {
            const previousMove =
              moveHistory.value[moveHistory.value.length - 1];
            lastMove.value = {
              from: previousMove.from,
              to: previousMove.to,
            };
          } else {
            lastMove.value = { from: null, to: null };
          }

          currentReplayIndex.value = moveHistory.value.length;
          break;

        case "preStartUpdate":
          if (timerStore) {
            timerStore.preSeconds = data.preStartTime;
          }
          break;

        case "gameOver":
          console.log("Конец игры:", data);
          if (data.reason === "timeOut") {
            result.value = {
              type: data.winner === "w" ? "whiteWin" : "blackWin",
              reason: "timeOut",
            };
          } else if (data.reason === "no_first_move") {
            result.value = {
              type: "canceledGame",
              reason: "no_move",
            };
          } else if (data.reason === "give-up") {
            result.value = {
              type: data.winner === "w" ? "whiteWin" : "blackWin",
              reason: "give-up",
            };
          } else if (data.reason === "agreed-draw") {
            result.value = {
              type: "draw",
              reason: "agreed-draw",
            };
          } else if (data.reason === "checkMate") {
            result.value = {
              type: data.winner === "w" ? "whiteWin" : "blackWin",
              reason: "checkMate",
            };
          } else if (
            [
              "stalemate",
              "50-move-rule",
              "threefold-repetition",
              "insufficient-material",
            ].includes(data.reason)
          ) {
            result.value = {
              type: "draw",
              reason: data.reason,
            };
          } else {
            console.warn("Неизвестная причина окончания игры:", data.reason);
            result.value = {
              type:
                data.winner === "w"
                  ? "whiteWin"
                  : data.winner === "b"
                    ? "blackWin"
                    : "draw",
              reason: data.reason || "unknown",
            };
          }
          break;

        default:
          console.warn("Неизвестный тип сообщения:", data.type);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket закрыт");
      ws = null;
    };

    ws.onerror = (err) => {
      console.error("Ошибка WebSocket:", err);
    };
  }
  /**
   * Отправляет ход на сервер.
   */
  function sendMove(from, to, promotion = "q") {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket не открыт");
      return;
    }

    if (!currentRoomId.value) {
      console.warn("Нет currentRoomId — ход не отправлен");
      return;
    }

    const payload = {
      type: "make_move",
      roomId: currentRoomId.value,
      move: {
        from,
        to,
        promotion,
      },
    };

    ws.send(JSON.stringify(payload));
    console.log(`Ход отправлен на сервер: ${from} → ${to}`);
  }
  /**
   * Разрывает WebSocket соединение и сбрасывает состояние игры.
   */
  function disconnect() {
    if (!ws) return;

    if (ws.onopen) ws.onopen = null;
    if (ws.onmessage) ws.onmessage = null;
    if (ws.onclose) ws.onclose = null;
    if (ws.onerror) ws.onerror = null;

    try {
      ws.close();
    } catch (e) {
      /* ignore */
    }
    ws = null;

    currentRoomId.value = null;
    playerColor.value = null;
    result.value = { type: null, reason: null };
    gameStarted.value = false;
    moveHistory.value = [];
    resetBoard();
    shouldRedirect.value = null;

    console.log("🔌 Отключились от игры");
  }

  /**
   * Завершает игру и отправляет сообщение на сервер
   */
  function endGame(reason: GameReason, winner: "w" | "b" | null = null) {
    if (reason === "checkMate") {
      result.value = {
        type: winner === "w" ? "whiteWin" : "blackWin",
        reason: "checkMate",
      };
    } else if (
      [
        "stalemate",
        "50-move-rule",
        "threefold-repetition",
        "insufficient-material",
        "agreed-draw",
      ].includes(reason)
    ) {
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

    const isChessEnding = [
      "checkMate",
      "stalemate",
      "50-move-rule",
      "threefold-repetition",
      "insufficient-material",
    ].includes(reason);

    if (!isChessEnding && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "game_over",
          roomId: currentRoomId.value,
          reason,
          winner,
        }),
      );
      console.log(
        "📤 Отправил game_over на сервер для нешахматного окончания:",
        reason,
      );
    }

    console.log(
      "Игра окончена:",
      reason,
      winner ? `победитель ${winner}` : "ничья",
    );
  }
  /**
   * Универсальная отправка сообщений на сервер.
   * 
   * @param {string} messageType - тип сообщения
   * @param {Object} extraData
   */
  function sendToServer(messageType, extraData = {}) {
    if (!ws || ws.readyState !== WebSocket.OPEN || !currentRoomId.value) {
      console.warn("WebSocket не подключён или нет roomId");
      return;
    }

    const payload = {
      type: messageType,
      roomId: currentRoomId.value,
      ...extraData,
    };

    ws.send(JSON.stringify(payload));
    console.log("Отправлено на сервер:", payload);
  }
  /**
   * Принимает предложение отката хода.
   */
  function acceptUndo() {
    offerUndo.value = false;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "accept-undo",
          roomId: currentRoomId.value,
        }),
      );
      console.log("Отправил accept-undo на сервер");
    }
  }
  /**
   * Отклоняет предложение отката хода.
   */
  function rejectUndo() {
    offerUndo.value = false;
  }
  /**
   * Синхронизирует состояние игры из FEN строки.
   * Используется при получении позиции с сервера.
   * 
   * @param {string} fenString
   */
  function syncFromFen(fenString: string) {
    chess.value.load(fenString);
    fen.value = chess.value.fen();
    currentTurn.value = chess.value.turn();
  }
  /**
   * Полностью очищает состояние игры и закрывает соединение
   */
  function leaveCurrentGame() {
    if (ws) {
      try {
        ws.close();
      } catch (e) {}
      ws = null;
    }

    currentRoomId.value = null;
    playerColor.value = null;
    playersCount.value = 0;
    result.value = { type: null, reason: null };
    gameStarted.value = false;
    moveHistory.value = [];
    resetBoard();

    opponent.value = {
      id: null,
      username: "Opponent",
      blitzRating: 1200,
    };
  }

  /**
 * Загрузка завершённой партии для просмотра
 */
const loadFinishedGame = async (gameId: string) => {
  leaveCurrentGame()

  try {
    const { fetchGameById } = useGames();
    const gameData = await fetchGameById(gameId);

    if (!gameData) {
      console.warn(`Партия ${gameId} не найдена`);
      return false;
    }

    whitePlayer.value = {
      username: gameData.whiteUsername || "White",
      blitzRating: gameData.whiteRating ?? 1200,
    };

    blackPlayer.value = {
      username: gameData.blackUsername || "Black",
      blitzRating: gameData.blackRating ?? 1200,
    };

    const [minutes] = String(gameData.timeControl || "3+0")
      .split("+")
      .map(Number);

    const initialSeconds = (minutes || 3) * 60;

    timerStore.whiteSeconds = initialSeconds;
    timerStore.blackSeconds = initialSeconds;
    timerStore.activeColor = null;

    moveHistory.value = [];
    chess.value.reset();

    const rawMoves =
      typeof gameData.moves === "string"
        ? JSON.parse(gameData.moves)
        : Array.isArray(gameData.moves)
          ? gameData.moves
          : [];

    for (const move of rawMoves) {
      let applied = null;

      if (typeof move === "string") {
        applied = chess.value.move(move);
      } else if (move?.from && move?.to) {
        applied = chess.value.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion || move.promotedTo || "q",
        });
      }

      if (!applied) continue;

      moveHistory.value.push({
        from: applied.from,
        to: applied.to,
        piece: applied.piece?.toUpperCase(),
        san: applied.san,              
        turn: applied.color === "w" ? "b" : "w",
        promotedTo: applied.promotion,
        fen: chess.value.fen(),
      });
    }

    result.value = {
      type: gameData.result || null,
      reason: gameData.reason || null
    };

    playerColor.value = gameData.playerColor || "w";
    currentRoomId.value = null;        

    let targetFen = gameData.finalFen;
    if (!targetFen && moveHistory.value.length > 0) {
      targetFen = moveHistory.value[moveHistory.value.length - 1]?.fen;
    }

    if (targetFen) {
      chess.value.load(targetFen);
      console.log("FEN загружен:", targetFen);
    } else {
      chess.value.reset();
    }

    fen.value = chess.value.fen();
    currentTurn.value = chess.value.turn();
    currentReplayIndex.value = moveHistory.value.length;

    // Переходим в конец партии
    goToMove(moveHistory.value.length);

    console.log(`Завершённая партия ${gameId} загружена (${moveHistory.value.length} ходов)`);
    return true;

  } catch (e) {
    console.error("Ошибка загрузки завершённой партии:", e);
    return false;
  }
};

  return {
    currentTurn,
    currentRoomId,
    fen,
    lastMove,
    result,
    opponentColor,
    playersCount,
    shouldRedirect,
    playerColor,
    opponent,
    whitePlayer,
    blackPlayer,
    gameStarted,
    moveHistory,
    offerDraw,
    offerUndo,
    promotionMove,
    showPromotionModal,
    currentReplayIndex,
    inviteParams,
    goToMove,
    loadFinishedGame,
    isReplayMode,
    setInitialPosition: resetBoard,
    makeMove,
    applyMove,
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
    completePromotion,
    cancelPromotion,
    leaveCurrentGame,
    syncFromFen,
    chess: chess,
  };
});
