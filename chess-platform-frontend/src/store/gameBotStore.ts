import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useGameStore } from "./gameStore";
import { useStockfish } from "@/composables/useStockfish";
import { useSound } from "@/composables/utils/useSound";
import { nextTick } from "vue";

export const useBotGameStore = defineStore("gameBot", () => {
  const gameStore = useGameStore();
  const stockfish = useStockfish();

  const { startSound } = useSound()

  /**
   * Параметры бота, выбранные в модальном окне
   */
  const botParams = ref({
    difficulty: "4",
  });
  /**
   * Цвет игрока (выбран в модальном окне)
   */
  const playerColor = ref<"w" | "b">("w");
  /**
   * Игра с ботом уже началась?
   */
  const isGameStarted = ref(false);
  /**
   * Сейчас бот думает над своим ходом?
   */
  const isBotThinking = computed(() => stockfish.isThinking.value);
  /**
   * Цвет бота (вычисляется автоматически)
   */
  const botColor = computed(() => (playerColor.value === "w" ? "b" : "w"));

  const waitForReady = () => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (stockfish.isReady.value) {
          clearInterval(interval);
          resolve(true);
        }
      }, 10);
    });
  };

  /**
   * Запуск игры с ботом после выбора настроек в модальном окне
   */
  const startBotGame = async () => {
    startSound()
    
    gameStore.setPlayerColor(playerColor.value);
    gameStore.setInitialPosition();

    isGameStarted.value = true;

    const difficultyLevel = parseInt(botParams.value.difficulty);
    stockfish.init(difficultyLevel);

    await waitForReady(); 

    if (playerColor.value === "b") {
      makeBotMove();
    }
  };

  /**
   * Выполняется после хода игрока
   */
  const onPlayerMove = async (from, to, promotion = 'q') => {
    if (isBotThinking.value) return;

    const success = gameStore.makeMove(from, to, promotion);
    if (!success) return;

    if (!gameStore.result.type) {
      await nextTick();
      makeBotMove();
    }
  };

  /**
   * Бот делает ход
   */
  const makeBotMove = async () => {
    console.time("botMove");
    if (gameStore.result.type || gameStore.currentTurn !== botColor.value) return;

    const fen = gameStore.chess.fen();
    const level = parseInt(botParams.value.difficulty);

    const fenBefore = gameStore.chess.fen();
    const bestMove = await stockfish.getBestMove(fen, level);

    if (fenBefore !== gameStore.chess.fen()) return;
    if (gameStore.currentTurn !== botColor.value) return;

    console.timeEnd("botMove");

    if (!bestMove || typeof bestMove !== "string") return;

    const from = bestMove.slice(0, 2);
    const to = bestMove.slice(2, 4);
    const promotion = bestMove.length > 4 ? bestMove[4] : null;

    gameStore.makeMove(from, to, promotion);
  };

  const revanche = async () => {
    playerColor.value = playerColor.value === "w" ? "b" : "w"
    
    resetBotGame()
    await nextTick()

    startBotGame()
  }

  /**
   * Полный сброс игры с ботом
   */
  const resetBotGame = () => {
    isGameStarted.value = false;
    gameStore.setInitialPosition();
    gameStore.result = { type: null, reason: null };
    gameStore.moveHistory = []              
    gameStore.currentReplayIndex = -1
  };

  const setDifficulty = (level: string) => {
    botParams.value.difficulty = level;
  };

  watch(
    () => gameStore.result.type,
    (result) => {
      if (result) {
        console.log("Игра с ботом завершена:", result);
      }
    },
  );

  return {
    botParams,
    playerColor,
    isGameStarted,
    isBotThinking,
    botColor,
    startBotGame,
    onPlayerMove,
    resetBotGame,
    setDifficulty,
    revanche
  };
});
