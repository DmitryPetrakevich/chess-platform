import { ref, onUnmounted } from "vue";
import { Chess } from "chess.js";

export function useStockfish() {
  /**
   * Web Worker, в котором работает Stockfish
   */
  const worker = ref<Worker | null>(null);
  /**
   * Готов ли Stockfish к работе (получил uciok)
   */
  const isReady = ref(false);
  /**
   * Сейчас бот думает над ходом?
   */
  const isThinking = ref(false);
  /**
   * Последняя оценка позиции в пешках (например +1.45)
   */
  const lastEvaluation = ref<number | null>(null);
  /**
   * Уникальный идентификатор текущего запроса к движку.
   *
   * Используется для защиты от race condition:
   * если приходит ответ от старого запроса (устаревшая позиция),
   * он игнорируется.
   *
   * Каждый новый вызов getBestMove увеличивает это значение.
   */
  let currentRequestId = 0;
  /**
   * Предустановленные уровни сложности бота.
   *
   * time — время размышления на ход (в миллисекундах)
   */
  const BOT_LEVELS = {
    1: { time: 200 },
    2: { time: 300 },
    3: { time: 500 },
    4: { time: 700 },
    5: { time: 900 },
    6: { time: 1200 },
    7: { time: 1500 },
    8: { time: 2000 },
    9: { time: 2500 },
    10: { time: 3000 },
  };

  /**
   * Инициализация Stockfish
   * @param skillLevel - уровень сложности бота от 1 до 20
   */
  const init = (level: number = 4) => {
    if (worker.value) worker.value.terminate();

    worker.value = new Worker("/stockfish/stockfish.js");
    const config = BOT_LEVELS[level] || BOT_LEVELS[4];

    worker.value.onmessage = (event) => {
      const message = event.data;

      if (message === "uciok") {
        isReady.value = true;

        worker.value?.postMessage("setoption name MultiPV value 5");
      }

      if (message.includes("score cp")) {
        const match = message.match(/score cp (-?\d+)/);
        if (match) lastEvaluation.value = parseInt(match[1]) / 100;
      }
    };

    worker.value.postMessage("uci");
  };

  /**
   * Запрашивает у Stockfish лучший ход для текущей позиции
   * @param fen - текущая позиция в формате FEN
   * @param moveTime - сколько миллисекунд думать (чем больше — тем сильнее)
   */
  const getBestMove = (fen: string, level: number = 4) => {
    return new Promise((resolve) => {
      let candidateMoves: string[] = [];
      if (!worker.value || !isReady.value) {
        resolve(null);
        return;
      }

      const requestId = ++currentRequestId;
      const config = BOT_LEVELS[level] || BOT_LEVELS[4];

      isThinking.value = true;

      const handler = (event) => {
        const msg = event.data;

        if (msg.includes("multipv")) {
          const match = msg.match(/ pv ([a-h][1-8][a-h][1-8][qrbn]?)/);

          if (match && match[1]) {
            if (!candidateMoves.includes(match[1])) {
              candidateMoves.push(match[1]);
            }
          }
        }

        if (msg.startsWith("bestmove")) {
          if (requestId !== currentRequestId) return;

          worker.value?.removeEventListener("message", handler);

          let chosenMove;

          if (candidateMoves.length > 0) {
            chosenMove = chooseMoveByLevel(candidateMoves, level, fen);
          } else {
            chosenMove = msg.split(" ")[1];
          }

          const delay = getThinkingDelay(level, fen);

          setTimeout(() => {
            isThinking.value = false;
            resolve(chosenMove && chosenMove !== "(none)" ? chosenMove : null);
          }, delay);

          candidateMoves = [];
        }
      };

      worker.value.addEventListener("message", handler);
      worker.value.postMessage("stop");
      worker.value.postMessage(`position fen ${fen}`);
      worker.value.postMessage(`go movetime ${config.time}`);
    });
  };

  /**
   * Изменяет уровень сложности бота (1-10)
   * @param level - уровень бота
   */
  const setSkillLevel = (level: number) => {
    if (worker.value && isReady.value) {
      worker.value.postMessage(`setoption name Skill Level value ${level}`);
    }
  };

  onUnmounted(() => {
    if (worker.value) {
      worker.value.terminate();
      worker.value = null;
    }
  });

  function getRandomMove(fen: string) {
    const chess = new Chess(fen);
    const moves = chess.moves({ verbose: true });

    if (!moves.length) return null;

    const random = moves[Math.floor(Math.random() * moves.length)];
    return random.from + random.to + (random.promotion || "");
  }

  function chooseMoveByLevel(moves: string[], level: number, fen: string) {
    if (level <= 1) {
      return getRandomMove(fen);
    }

    if (level <= 2) {
      if (Math.random() < 0.2) {
        return moves[1] || moves[0];
      }
      return moves[0];
    }

    if (level <= 3) {
      if (Math.random() < 0.3) {
        return moves[1] || moves[0];
      }
      return moves[0];
    }

    return moves[0];
  }

  function getThinkingDelay(level: number, fen: string) {
    const chess = new Chess(fen);
    const moveCount = chess.moves().length;

    const complexity = Math.min(moveCount / 20, 1);

    const base = {
      1: 300,
      2: 500,
      3: 700,
      4: 900,
      5: 1100,
      6: 1400,
      7: 1700,
      8: 2000,
      9: 2300,
      10: 2600,
    };

    const jitter = Math.random() * 300;

    return (base[level] || 1000) * (0.7 + complexity) + jitter;
  }

  return {
    isReady,
    isThinking,
    lastEvaluation,
    init,
    getBestMove,
    setSkillLevel,
  };
}
