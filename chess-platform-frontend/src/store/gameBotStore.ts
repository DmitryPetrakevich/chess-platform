import { defineStore } from "pinia";
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useGameStore } from "./gameStore";
import { useStockfish } from "@/composables/useStockfish";
import { useSound } from "@/composables/utils/useSound";

export const useBotGameStore = defineStore("gameBot", () => {
  const gameStore = useGameStore();
  const stockfish = useStockfish();
  const { startSound } = useSound();

  const STORAGE_KEY = 'currentBotGame';

  const botParams = ref({ difficulty: "4" });
  const playerColor = ref<"w" | "b">("w");
  const isGameStarted = ref(false);

  const isBotThinking = computed(() => stockfish.isThinking.value);
  const botColor = computed(() => (playerColor.value === "w" ? "b" : "w"));

const saveGameState = () => {
  if (!isGameStarted.value || !gameStore.chess) return;

  const fen = gameStore.chess.fen();
  if (fen === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') return;

  const state = {
    playerColor: playerColor.value,
    difficulty: botParams.value.difficulty,
    fen: fen,
    moveHistory: [...gameStore.moveHistory],           
    currentTurn: gameStore.currentTurn,
    result: gameStore.result,
    lastMove: gameStore.lastMove
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const restoreGameState = async (): Promise<boolean> => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return false;

  try {
    const state = JSON.parse(saved);

    playerColor.value = state.playerColor || "w";
    botParams.value.difficulty = state.difficulty || "4";
    isGameStarted.value = true;

    // Сброс
    gameStore.setInitialPosition();
    gameStore.result = { type: null, reason: null };

    if (state.fen && typeof state.fen === 'string' && state.fen.length > 15) {
      const success = gameStore.chess.load(state.fen);
    }

    if (Array.isArray(state.moveHistory)) {
      gameStore.moveHistory = state.moveHistory;
    }

    gameStore.currentReplayIndex = gameStore.moveHistory.length;

    if (state.result) gameStore.result = state.result;
    if (state.lastMove) gameStore.lastMove = state.lastMove;


    await nextTick();
    gameStore.goToMove(gameStore.moveHistory.length);   

    const difficultyLevel = parseInt(botParams.value.difficulty);
    stockfish.init(difficultyLevel);

    await new Promise<void>((resolve) => {
      if (stockfish.isReady.value) {
        resolve();
        return;
      }
      const check = setInterval(() => {
        if (stockfish.isReady.value) {
          clearInterval(check);
          resolve();
        }
      }, 30);
    });

    await nextTick();

    // Если сейчас ход бота — делаем ход
    if (gameStore.currentTurn === botColor.value && !gameStore.result.type) {
      await makeBotMove();
    }

    return true;

  } catch (e) {
    console.error('Ошибка восстановления:', e);
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
};

  const startBotGame = async () => {
    startSound();
    
    gameStore.setPlayerColor(playerColor.value);
    gameStore.setInitialPosition();

    isGameStarted.value = true;

    const difficultyLevel = parseInt(botParams.value.difficulty);
    stockfish.init(difficultyLevel);

    await new Promise<void>((resolve) => {
      if (stockfish.isReady.value) {
        resolve();
        return;
      }
      const check = setInterval(() => {
        if (stockfish.isReady.value) {
          clearInterval(check);
          resolve();
        }
      }, 30);
    });

    await nextTick();

    if (playerColor.value === "b") {
      makeBotMove();
    }
  };

  const onPlayerMove = async (from: string, to: string, promotion = 'q') => {
    if (isBotThinking.value) return;

    const success = gameStore.makeMove(from, to, promotion);
    if (!success) return;

    if (!gameStore.result.type) {
      await nextTick();
      makeBotMove();
    }
  };

  const makeBotMove = async () => {
    if (isBotThinking.value) return;
    if (gameStore.result.type || gameStore.currentTurn !== botColor.value) return;

    console.time("botMove");

    const fen = gameStore.chess.fen();
    const level = parseInt(botParams.value.difficulty);

    const bestMove = await stockfish.getBestMove(fen, level);

    if (!bestMove || typeof bestMove !== "string") {
      console.timeEnd("botMove");
      return;
    }

    const from = bestMove.slice(0, 2);
    const to = bestMove.slice(2, 4);
    const promotion = bestMove.length > 4 ? bestMove[4] : null;

    gameStore.makeMove(from, to, promotion);
    console.timeEnd("botMove");
  };

  const revanche = async () => {
    playerColor.value = playerColor.value === "w" ? "b" : "w";
    resetBotGame();
    await nextTick();
    startBotGame();
  };

  const resetBotGame = () => {
    isGameStarted.value = false;
    localStorage.removeItem(STORAGE_KEY);

    gameStore.setInitialPosition();
    gameStore.result = { type: null, reason: null };
    gameStore.moveHistory = [];
    gameStore.currentReplayIndex = -1;
  };

  const setDifficulty = (level: string) => {
    botParams.value.difficulty = level;
  };

  watch([
    () => gameStore.chess?.fen(),
    () => gameStore.moveHistory.length,
    () => gameStore.result.type,
    playerColor,
    () => botParams.value.difficulty
  ], saveGameState, { deep: true });

  onMounted(async () => {
    await restoreGameState();
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
    revanche,
  };
});