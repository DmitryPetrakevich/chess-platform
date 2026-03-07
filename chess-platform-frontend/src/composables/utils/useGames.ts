// composables/utils/useGames.js
import { computed, ref } from "vue";
import { useUserStore } from "@/store/userStore";

export function useGames() {
  const userStore = useUserStore()

  const games = ref([]);
  const loading = ref(false)
  const error = ref(null)

  const currentGame = ref(null)
  const loadingGame = ref(false)
  const gameError = ref(null)

  const fetchGames = async () => {
    if(!userStore.userId) {
      error.value = "Пользователь не найден!"  // ← исправил!
      return
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `http://localhost:3000/api/games?userId=${userStore.userId}`
      )

      if(!response.ok) {
        throw new Error("Не удалось получить данные о партии")
      }

      games.value = await response.json()

    } catch(err) {
      console.error("Ошибка загрузки партии", err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  const fetchGameById = async (gameId) => {
    if (!gameId) {
      gameError.value = 'Game ID is required'
      return null
    }

    loadingGame.value = true
    gameError.value = null
    
    try {
      const response = await fetch(`http://localhost:3000/api/games/${gameId}`)
      
      const data = await response.json()  // ← читаем ответ даже при ошибке
      
      if (!response.ok) {
        throw new Error(data.error || 'Game not found')  // ← берем сообщение из ответа
      }
      
      currentGame.value = data
      return currentGame.value
    } catch (err) {
      console.error(`Ошибка загрузки игры ${gameId}:`, err)
      gameError.value = err.message
      return null
    } finally {
      loadingGame.value = false
    }
  }

  // Очистка текущей игры
  const clearCurrentGame = () => {
    currentGame.value = null
    gameError.value = null
  }

  const filteredGames = computed(() => games.value)

  return {
    games,
    loading,
    error,
    fetchGames,
    filteredGames,

    currentGame,
    loadingGame,
    gameError,
    fetchGameById,
    clearCurrentGame
  }
}