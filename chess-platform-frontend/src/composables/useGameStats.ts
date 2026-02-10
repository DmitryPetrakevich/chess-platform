import { ref, computed, onMounted, watch } from 'vue'

/**
 * Результат завершенной игры для статистики
 * @property {number} score - Количество верных кликов в игре
 * @property {'white' | 'black'} color - Цвет фигур, за которые играл пользователь
 * @property {'timer' | 'infinite'} mode - Режим игры
 * @property {Date} [date] - Дата и время окончания игры 
 */
export interface GameResult {
  score: number
  color: 'white' | 'black'
  mode: 'timer' | 'infinite'
  date?: Date
}

export function useGameStats() {
  /**
   * История всех сыгранных игр
   * - Хранит результаты всех завершенных тренировок
   * - Сохраняется в localStorage под ключом 'chessGameHistory'
   * - Загружается автоматически при инициализации
   * - Используется для расчета всей статистики
   */
  const gameHistory = ref<GameResult[]>([])

    /**
   * Загружает историю игр из localStorage
   * - Читает данные из localStorage по ключу 'chessGameHistory'
   * - Парсит JSON строку в массив объектов GameResult
   * - Восстанавливает объекты Date из строк
   * - При ошибках парсинга инициализирует пустым массивом
   */
  const loadGameHistory = () => {
    const saved = localStorage.getItem('chessGameHistory')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        gameHistory.value = data.map((item: any) => ({
          ...item,
          date: item.date ? new Date(item.date) : new Date()
        }))
      } catch {
        gameHistory.value = []
      }
    }
  }

  /**
   * Сохраняет текущую игру в историю
   * @description Сохраняет результат игры в историю и localStorage
   * - Проверяет, что score > 0 и mode === 'timer' (сохраняем только таймерные игры)
   * - Автоматически добавляет текущую дату
   * - Обновляет localStorage
   * 
   * @param {number} score - Количество верных кликов в игре
   * @param {'white' | 'black'} color - Цвет фигур игрока
   * @param {'timer' | 'infinite'} mode - Режим игры
   * 
   * @sideEffects 
   * - Добавляет запись в gameHistory.value
   * - Обновляет localStorage
   * - Пересчитывает все computed свойства статистики
   */
  const saveCurrentGame = (score: number, color: 'white' | 'black', mode: 'timer' | 'infinite') => {
    if (score > 0 && mode === 'timer') {
      const result: GameResult = {
        score,
        color,
        mode,
        date: new Date()
      }

      gameHistory.value.push(result)
      localStorage.setItem('chessGameHistory', JSON.stringify(gameHistory.value))
    }
  }

  /**
   * Средний результат для белых фигур
   * @description 
   * - Среднее арифметическое score по всем играм белыми фигурами
   * - Округлено до целого числа
   * - 0 если нет игр белыми
   * 
   * @returns {number} Средний результат белыми
   */
  const averageScoreWhite = computed(() => {
    const whiteGames = gameHistory.value.filter(game => game.color === 'white')
    if (whiteGames.length === 0) return 0
    const total = whiteGames.reduce((sum, game) => sum + game.score, 0)
    return Math.round(total / whiteGames.length)
  })

  /**
   * Средний результат для черных фигур
   * @description
    * - Среднее арифметическое score по всем играм черными фигурами
   * - Округлено до целого числа
   * - 0 если нет игр черными
   * 
   * @returns {number} Средний результат черными
   */
  const averageScoreBlack = computed(() => {
    const blackGames = gameHistory.value.filter(game => game.color === 'black')
    if (blackGames.length === 0) return 0
    const total = blackGames.reduce((sum, game) => sum + game.score, 0)
    return Math.round(total / blackGames.length)
  })

  /**
   * Количество сыгранных игр белыми фигурами
   * @description 
   * - Количество записей в gameHistory с color === 'white'
   * 
   * @returns {number} Количество игр белыми
   */
  const whiteGamesCount = computed(
    () => gameHistory.value.filter(game => game.color === 'white').length
  )

  /**
   * Количество сыгранных игр черными фигурами
   * @description 
   * - Количество записей в gameHistory с color === 'black'
   * 
   * @returns {number} Количество игр черными
   */
  const blackGamesCount = computed(
    () => gameHistory.value.filter(game => game.color === 'black').length
  )

  /**
   * Лучший результат для белых фигур
   * @description 
   * - Максимальный score среди всех игр белыми фигурами
   * - 0 если нет игр белыми
   * 
   * @returns {number} Рекордный результат белыми
   */
  const bestScoreWhite = computed(() => {
    const whiteGames = gameHistory.value.filter(game => game.color === 'white')
    if (whiteGames.length === 0) return 0
    return Math.max(...whiteGames.map(game => game.score))
  })

  /**
   * Лучший результат для черных фигур
   * @description 
   * - Максимальный score среди всех игр черными фигурами
   * - 0 если нет игр черными
   * 
   * @returns {number} Рекордный результат черными
   */
  const bestScoreBlack = computed(() => {
    const blackGames = gameHistory.value.filter(game => game.color === 'black')
    if (blackGames.length === 0) return 0
    return Math.max(...blackGames.map(game => game.score))
  })

  /**
 * Проверяет, является ли результат новым рекордом для указанного цвета
 * @description Сравнивает текущий результат с лучшим результатом для указанного цвета
 * 
 * @param {number} score - Текущий результат
 * @param {'white' | 'black'} color - Цвет фигур
 * @returns {boolean} true если это новый рекорд
 */
const isNewRecord = (score: number, color: 'white' | 'black'): boolean => {
  if (score <= 0) return false
  
  if (color === 'white') {
    return score > bestScoreWhite.value
  } else {
    return score > bestScoreBlack.value
  }
}

  onMounted(() => {
    loadGameHistory()
  })

  return {
    gameHistory,
    averageScoreWhite,
    averageScoreBlack,
    whiteGamesCount,
    blackGamesCount,
    bestScoreWhite,
    bestScoreBlack,
    saveCurrentGame,
    loadGameHistory,
    isNewRecord
  }
}