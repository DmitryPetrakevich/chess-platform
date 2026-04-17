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
   * Инициализация Stockfish
   * @param skillLevel - уровень сложности бота от 1 до 20
   */
  const init = (skillLevel: number = 10) => {
    if (worker.value) worker.value.terminate();

    worker.value = new Worker(new URL("../stockfish/stockfish.js", import.meta.url).href);

    worker.value.onmessage = (event: MessageEvent) => {
      const message = event.data;

      if (message === "uciok") {
        isReady.value = true;
        worker.value?.postMessage(`setoption name Skill Level value ${skillLevel}`);
    }

      if (message.startsWith("bestmove")) {
        isThinking.value = false;
        const move = message.split(" ")[1];
        if (move && move !== "(none)") {
          console.log("Stockfish предложил ход:", move);
          // Здесь мы будем передавать ход дальше (через событие или callback)
        }
      }

      // Оценка позиции 
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
  const getBestMove = (fen: string, moveTime: number = 800) => {
    return new Promise((resolve) => {
      if (!worker.value || !isReady.value) {
        resolve(null);
        return;
      }

      isThinking.value = true;

      const handler = (event: MessageEvent) => {
        const msg = event.data;
        if (msg.startsWith("bestmove")) {
          worker.value?.removeEventListener("message", handler);
          isThinking.value = false;

          const move = msg.split(" ")[1];
          resolve(move && move !== "(none)" ? move : null);
        }
      };

      worker.value.addEventListener("message", handler);
      worker.value.postMessage(`position fen ${fen}`);
      worker.value.postMessage(`go movetime ${moveTime}`);
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
