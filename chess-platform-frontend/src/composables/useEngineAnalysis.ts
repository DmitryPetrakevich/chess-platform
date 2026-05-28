import { ref, onUnmounted } from "vue";

export function useEngineAnalysis() {
  /**
   * Stockfish worker
   */
  const worker = ref<Worker | null>(null);

  /**
   * Готов ли движок
   */
  const isReady = ref(false);

  /**
   * Идет ли анализ
   */
  const isAnalyzing = ref(false);

  /**
   * Оценка позиции
   */
  const evaluation = ref<number | null>(null);

  /**
   * Лучший ход
   */
  const bestMove = ref<string | null>(null);

  /**
   * Глубина анализа
   */
  const depth = ref(0);

  /**
   * ID текущего анализа
   *
   * Нужно для защиты от race condition
   */
  let currentAnalysisId = 0;

  /**
   * Последняя анализируемая позиция
   */
  const currentFen = ref("");

  /**
   * Инициализация движка
   */
  const init = () => {
    if (worker.value) {
      worker.value.terminate();
    }

    worker.value = new Worker("/stockfish/stockfish.js");

    worker.value.onmessage = (event) => {
      const message = event.data;

      /**
       * Engine готов
       */
      if (message === "uciok") {
        isReady.value = true;

        /**
         * Только один лучший вариант
         */
        worker.value?.postMessage(
          "setoption name MultiPV value 1"
        );
      }
    };

    worker.value.postMessage("uci");
  };

  /**
   * Анализ позиции
   */
  const analyzePosition = (fen: string) => {
    if (!worker.value || !isReady.value) return;

    /**
     * Новый анализ
     */
    const analysisId = ++currentAnalysisId;
    currentFen.value = fen;
    isAnalyzing.value = true;

    /**
     * Останавливаем старый анализ
     */
    worker.value.postMessage("stop");

    /**
     * Сбрасываем данные
     */
    evaluation.value = null;
    bestMove.value = null;
    depth.value = 0;

    /**
     * Временный handler
     *
     * ВАЖНО:
     * каждый анализ имеет свой handler
     */
    const handler = (event: MessageEvent) => {
      /**
       * Если анализ уже устарел —
       * игнорируем сообщения
       */
      if (analysisId !== currentAnalysisId) {
        return;
      }

      const message = event.data;

      /**
       * Парсим depth
       */
      const depthMatch = message.match(/depth (\d+)/);

      if (depthMatch) {
        depth.value = parseInt(depthMatch[1]);
      }

      /**
       * Парсим лучший ход
       */
      const pvMatch = message.match(
        / pv ([a-h][1-8][a-h][1-8][qrbn]?)/
      );

      if (pvMatch && pvMatch[1]) {
        bestMove.value = pvMatch[1];
      }

      /**
       * Парсим оценку
       */
      const evalMatch = message.match(
        /score cp (-?\d+)/
      );

      if (evalMatch) {
        const rawEval =
          parseInt(evalMatch[1]) / 100;

        /**
         * В FEN:
         * w — ход белых
         * b — ход черных
         *
         * Stockfish показывает eval
         * относительно стороны хода.
         *
         * Мы приводим:
         * + = лучше белым
         * - = лучше черным
         */
        const turn =
          currentFen.value.split(" ")[1];

        evaluation.value =
          turn === "w"
            ? rawEval
            : -rawEval;
      }

      /**
       * Анализ завершен
       */
      if (message.startsWith("bestmove")) {
        isAnalyzing.value = false;

        worker.value?.removeEventListener(
          "message",
          handler
        );
      }
    };

    worker.value.addEventListener(
      "message",
      handler
    );

    /**
     * Передаем позицию
     */
    worker.value.postMessage(
      `position fen ${fen}`
    );

    /**
     * Анализ 700ms
     *
     * Намного стабильнее чем infinite
     */
    worker.value.postMessage("go movetime 5000");

    // worker.value.postMessage("go infinite");
  };

  /**
   * Остановить анализ
   */
  const stopAnalysis = () => {
    if (!worker.value) return;

    worker.value.postMessage("stop");

    isAnalyzing.value = false;
  };

  /**
   * Уничтожение worker
   */
  const destroy = () => {
    stopAnalysis();

    if (worker.value) {
      worker.value.terminate();
      worker.value = null;
    }
  };

  onUnmounted(() => {
    destroy();
  });

  return {
    isReady,
    isAnalyzing,
    evaluation,
    bestMove,
    depth,
    init,
    analyzePosition,
    stopAnalysis,
    destroy,
  };
}