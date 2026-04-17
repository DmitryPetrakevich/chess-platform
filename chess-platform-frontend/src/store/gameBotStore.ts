import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useGameStore } from "./gameStore";
import { useStockfish } from "@/composables/useStockfish";

export const useBotGameStore = defineStore("gameBot", () => {
  const gameStore = useGameStore();
  const stockfish = useStockfish();
  
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
  const isBotThinking = computed(() => stockfish.isThinking);
  /** 
   * Цвет бота (вычисляется автоматически) 
  */
  const botColor = computed(() => playerColor.value === "w" ? "b" : "w");

  /**
   * Запуск игры с ботом после выбора настроек в модальном окне
   */
  const startBotGame = async () => {
    gameStore.setPlayerColor(playerColor.value);    
    gameStore.setInitialPosition();

    isGameStarted.value = true;

    const difficultyLevel = parseInt(botParams.value.difficulty);
    stockfish.init(difficultyLevel);

    console.log(`Игра с ботом начата. Игрок: ${playerColor.value === 'w' ? 'Белые' : 'Чёрные'}, сложность: ${difficultyLevel}`);

    // Если игрок выбрал чёрные — бот делает первый ход
    if (playerColor.value === "b") {
      setTimeout(makeBotMove, 700);
    }
  };

  /**
   * Выполняется после хода игрока
   */
  const onPlayerMove = async (from: string, to: string, promotion: string | null = null) => {
    if (isBotThinking.value) return;

    const success = gameStore.makeMove(from, to, promotion);
    if (!success) return;

    // Если после хода игрока игра не закончилась — запускаем бота
    if (!gameStore.result.type) {
      setTimeout(makeBotMove, 400); 
    }
  };

  /**
   * Бот делает ход
   */
  const makeBotMove = async () => {
    if (gameStore.result.type || gameStore.currentTurn !== botColor.value) return;

    const fen = gameStore.chess.fen();
    const bestMove = await stockfish.getBestMove(fen, 900); 

    if (!bestMove || typeof bestMove !== "string") return;

    const from = bestMove.slice(0, 2);
    const to = bestMove.slice(2, 4);
    const promotion = bestMove.length > 4 ? bestMove[4] : null;

    gameStore.makeMove(from, to, promotion);
  };

  /**
   * Полный сброс игры с ботом
   */
  const resetBotGame = () => {
    isGameStarted.value = false;
    gameStore.setInitialPosition();
    gameStore.result = { type: null, reason: null };
  };

  const setDifficulty = (level: string) => {
    botParams.value.difficulty = level;
  }

  // Следим за окончанием игры
  watch(() => gameStore.result.type, (result) => {
    if (result) {
      console.log("Игра с ботом завершена:", result);
    }
  });

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
  };
});