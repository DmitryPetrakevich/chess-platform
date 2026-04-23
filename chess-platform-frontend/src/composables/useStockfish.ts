import { ref, onUnmounted } from "vue";

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
   * elo  — ограничение силы движка (через UCI_Elo)
   * time — время размышления на ход (в миллисекундах)
   *
   * Комбинация этих параметров даёт более "человеческий"
   * и предсказуемый уровень игры.
   */
  const BOT_LEVELS = {
  1: { elo: 800, time: 100 },
  2: { elo: 1000, time: 150 },
  3: { elo: 1200, time: 250 },
  4: { elo: 1400, time: 400 },
  5: { elo: 1600, time: 600 },
  6: { elo: 1800, time: 900 },
  7: { elo: 2000, time: 1200 },
  8: { elo: 2200, time: 1600 },
  9: { elo: 2400, time: 2000 },
  10:{ elo: 2600, time: 3000 }
}
  /**
   * Инициализация Stockfish
   * @param skillLevel - уровень сложности бота от 1 до 20
   */
  const init = (level: number = 4) => {
    if (worker.value) worker.value.terminate();

    worker.value = new Worker('/stockfish/stockfish.js');
    const config = BOT_LEVELS[level] || BOT_LEVELS[4];

    worker.value.onmessage = (event) => {
      const message = event.data;

      if (message === "uciok") {
        isReady.value = true;

        worker.value?.postMessage("setoption name UCI_LimitStrength value true");
        worker.value?.postMessage(`setoption name UCI_Elo value ${config.elo}`);
        worker.value?.postMessage(`setoption name Skill Level value ${level * 2}`);
      }

      if (message.startsWith("bestmove")) {
        isThinking.value = false;
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
      if (!worker.value || !isReady.value) {
        resolve(null);
        return;
      }

      const requestId = ++currentRequestId;
      const config = BOT_LEVELS[level] || BOT_LEVELS[4];

      isThinking.value = true;

      const handler = (event) => {
        const msg = event.data;

        if (msg.startsWith("bestmove")) {
          if (requestId !== currentRequestId) return;

          worker.value?.removeEventListener("message", handler);
          isThinking.value = false;

          const move = msg.split(" ")[1];
          resolve(move && move !== "(none)" ? move : null);
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

  return {
    isReady,
    isThinking,
    lastEvaluation,
    init,
    getBestMove,
    setSkillLevel,
  };
}
