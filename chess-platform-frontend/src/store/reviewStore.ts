import { defineStore } from "pinia";
import { ref, computed, onMounted, watch } from "vue";
import { useGames } from "@/composables/utils/useGames";
import { useUserStore } from "./userStore";
import { Chess } from "chess.js";

export const useReviewStore = defineStore("review", () => {
  const user = useUserStore();

  /**
   * Индекс текущего отображаемого хода
   */
  const currentMoveIndex = ref(0);
  /**
   * ID загруженной игры
   */
  const currentGameId = ref("");

  const {
    currentGame,
    loadingGame,
    gameError,
    fetchGameById,
    clearCurrentGame,
  } = useGames();

  /**
   * Общее количество ходов в партии
   * @returns {number} Количество ходов или 0, если игра не загружена 
   */
  const totalMoves = computed(() => currentGame.value?.moves?.length || 0);
  /**
   * Переход к следующему ходу
   * @description Увеличивает currentMoveIndex на 1, если не достигнут конец партии
   */
  function nextMove() {
    if (currentMoveIndex.value < totalMoves.value) {
      currentMoveIndex.value++;
    }
  }
  /**
   * Переход к предыдущему ходу
   * @description Уменьшает currentMoveIndex на 1, если не находимся в начальной позиции
   */
  function prevMove() {
    if (currentMoveIndex.value > 0) {
      currentMoveIndex.value--;
    }
  }
  /**
   * Переход к начальной позиции
   * @description Устанавливает currentMoveIndex = 0 (начало партии)
   */
  function goToStart() {
    currentMoveIndex.value = 0;
  }
  /**
   * Переход к конечной позиции
   * @description Устанавливает currentMoveIndex на последний ход партии
   */
  function goToEnd() {
    currentMoveIndex.value = totalMoves.value;
  }
  /**
   * FEN позиции для текущего хода
   * @description Вычисляет позицию на доске на основе currentMoveIndex
   * @returns {string|undefined} FEN строку позиции или undefined, если игра не загружена
   */
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
  /**
   * Флаг переворота доски
   * @description Определяет, нужно ли перевернуть доску (true если пользователь играл черными)
   * @returns {boolean} true - доску нужно перевернуть, false - оставить как есть
   */
  const flipped = computed(() => {
    if (!currentGame.value || !user.userId) return false;

    return currentGame.value.blackUserId === user.userId;
  });
  /**
   * Загрузка игры по ID
   * @param {string} gameId -ID игры для загрузки
   * @description Загружает данные игры и устанавливает индекс на 0
   */
  async function loadGame(gameId) {
    currentGameId.value = gameId;
    await fetchGameById(gameId);
    if (currentGame.value?.moves) {
      currentMoveIndex.value = 0;
    }
  }
  /**
   * Переход к конкретному ходу
   * @param {number} moveCount - Количество ходов для отображения (0 - начало, totalMoves - конец)
   */
  function goToMove(moveCount: number) {
    if (moveCount >= 0 && moveCount <= totalMoves.value) {
      currentMoveIndex.value = moveCount;
    }
  }

  return {
    currentFen,
    currentGame,
    currentGameId,
    flipped,
    currentMoveIndex,
    totalMoves,
    loadingGame,
    gameError,
    loadGame,
    clearCurrentGame,
    nextMove,
    prevMove,
    goToStart,
    goToEnd,
    goToMove
  };
});
