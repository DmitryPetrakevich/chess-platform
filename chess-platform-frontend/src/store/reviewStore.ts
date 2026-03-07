import { defineStore } from "pinia";
import { ref, computed, onMounted, watch } from "vue";
import { useGames } from "@/composables/utils/useGames";
import { useUserStore } from "./userStore";
import { Chess } from "chess.js";

export const useReviewStore = defineStore("review", () => {
  const user = useUserStore();

  const currentMoveIndex = ref(0);
  const currentGameId = ref("");

  const {
    currentGame,
    loadingGame,
    gameError,
    fetchGameById,
    clearCurrentGame,
  } = useGames();

  const currentFen = computed(() => {
    if (!currentGame.value) return undefined;

    if (currentMoveIndex.value === 0) {
      return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    }

    const chess = new Chess();
    const movesToPlay = currentGame.value.moves.slice(
      0,
      currentMoveIndex.value,
    );

    try {
      for (const move of movesToPlay) {
        chess.move(move);
      }
    } catch (e) {
      console.error("Ошибка при воспроизведении хода:", e);
    }

    return chess.fen();
  });

  const flipped = computed(() => {
    if (!currentGame.value || !user.userId) return false;

    return currentGame.value.blackUserId === user.userId;
  });

  async function loadGame(gameId) {
    currentGameId.value = gameId;
    await fetchGameById(gameId);
    if (currentGame.value?.moves) {
      currentMoveIndex.value = currentGame.value.moves.length;
    }
  }

  watch(currentGame, (newGame) => {
    if (newGame && newGame.moves) {
      currentMoveIndex.value = newGame.moves.length;
    }
  });

  return {
    currentFen,
    currentGame,
    currentGameId,
    flipped,
    loadingGame,
    gameError,
    loadGame,
    clearCurrentGame,
  };
});
