import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";

export const useCoordinatesStore = defineStore("coordinates", () => {
  /**
   * Активный режим игры
   */
  const activeMode = ref("timer");
  /**
   * Цвет фигур, за которые играет пользователь
   */
  const activeColor = ref("white");
  /**
   * Ориентация доски (перевернута ли доска)
   */
  const flipped = ref(false);
  /**
   * Видимость фигур на доске
   */
  const showPieces = ref(true);
  /**
   * Видимость координат по краям доски (буквы a-h и цифры 1-8)
   */
  const showCoordinates = ref(true);
  /**
   * Текущий счет (количество верных кликов)
   */
  const score = ref(0);
  /**
   * Флаг активной тренировки
   */
  const activeTraining = ref(false);
  /**
   * Текущая целевая клетка для клика
   */
  const targetSquare = ref("");
  /**
   * Следующая целевая клетка (показывается справа от целевой)
   */
  const nextSquare = ref("");
  /**
   * Оставшееся время в режиме "timer" (целые секунды)
   */
  const timeLeft = ref(10);
  /**
   * Десятые доли секунды
   */
  const timeTenths = ref(0);
  /**
   * Флаг активной фазы игры (можно кликать по клеткам)
   */
  const isActive = ref(false);
  /**
   * Предыдущая целевая клетка (для предотвращения повторений)
   */
  const lastSquare = ref("");
  /**
   * Флаг отображения ошибки (неправильный клик)
   */
  const showError = ref(false);
  /**
   * Таймер для автоматического скрытия ошибки
   */
  const errorTimer = ref(null);
  /**
   * ID интервала для основного таймера (секунды)
   */
  let intervalID = 0;
  /**
   * ID интервала для таймера десятых долей секунды
   */
  let tenthsIntervalID = 0;

  const pieces = reactive<Record<string, string>>({
    a1: "wR",
    b1: "wN",
    c1: "wB",
    d1: "wQ",
    e1: "wK",
    f1: "wB",
    g1: "wN",
    h1: "wR",
    a2: "wP",
    b2: "wP",
    c2: "wP",
    d2: "wP",
    e2: "wP",
    f2: "wP",
    g2: "wP",
    h2: "wP",

    a7: "bP",
    b7: "bP",
    c7: "bP",
    d7: "bP",
    e7: "bP",
    f7: "bP",
    g7: "bP",
    h7: "bP",
    a8: "bR",
    b8: "bN",
    c8: "bB",
    d8: "bQ",
    e8: "bK",
    f8: "bB",
    g8: "bN",
    h8: "bR",
  });

  /**
   * Все координаты шахматной доски
   * @returns {string[]} Массив из 64 строк в формате "a1", "a2", ..., "h8"
   * @example ["a1", "a2", "a3", ..., "h7", "h8"]
   */
  const allCoordinates = computed(() => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"];
    const coords = [];
    for (const file of files) {
      for (const rank of ranks) {
        coords.push(`${file}${rank}`);
      }
    }
    return coords;
  });

  /**
   * Генерирует случайную координату клетки для тренировки
   * @returns {string} Случайная координата в формате "e4"
   */
  function generateRandomSquare() {
    let newSquare;
    do {
      const randomIndex = Math.floor(
        Math.random() * allCoordinates.value.length,
      );
      newSquare = allCoordinates.value[randomIndex];
    } while (newSquare === lastSquare.value); // Не повторять предыдущую

    lastSquare.value = newSquare;
    targetSquare.value = newSquare;
    generateNextSquare();

    return newSquare;
  }

  /**
   * Генерирует следующую цель для плавного перехода
   * @returns {string} Следующая координата клетки
   */
  function generateNextSquare() {
    let newNextSquare;
    do {
      const randomIndex = Math.floor(
        Math.random() * allCoordinates.value.length,
      );
      newNextSquare = allCoordinates.value[randomIndex];
    } while (newNextSquare === targetSquare.value); // Не повторять текущую

    nextSquare.value = newNextSquare;
    return newNextSquare;
  }

  /**
   * Обрабатывает клик по клетке доски
   * @param {string} squareId - Координата кликнутой клетки (например "e4")
   * @returns {boolean} Результат проверки:
   *   - true: клик был правильным
   *   - false: клик был неправильным или игра не активна
   * @description
   * - Проверяет, активна ли игра (isActive)
   * - Сравнивает squareId с текущей целью (targetSquare)
   * - При правильном клике:
   *   - Увеличивает счет (score++)
   *   - Обновляет текущую цель на следующую
   *   - Генерирует новую следующую цель
   * - При неправильном клике:
   *   - Показывает визуальную ошибку на 300мс
   *   - Сбрасывает таймер ошибки при повторном неправильном клике
   * @sideEffects
   * - При успехе: обновляет score, targetSquare, вызывает generateNextSquare()
   * - При ошибке: устанавливает showError на 300мс
   */
  function checkClick(squareId: string): boolean {
    if (!isActive.value) return false;

    if (squareId === targetSquare.value) {
      score.value++;
      targetSquare.value = nextSquare.value;
      generateNextSquare();

      return true;
    } else {
      showError.value = true;

      if (errorTimer.value) {
        clearTimeout(errorTimer.value);
      }

      errorTimer.value = setTimeout(() => {
        showError.value = false;
        errorTimer.value = null;
      }, 300);
    }
    return false;
  }

  /**
   * Начинает новую тренировку
   * @description Запускает процесс тренировки:
   * 1. Если выбран "random", случайно выбирает цвет и переворачивает доску при необходимости
   * 2. Сбрасывает все игровые состояния (счет, таймер, цели)
   * 3. Генерирует первую цель
   * 4. Через 500мс запускает таймер (если режим "timer")
   *
   * Таймер в режиме "timer":
   * - Основной интервал: обновляет timeLeft каждую секунду
   * - Вспомогательный: обновляет timeTenths каждые 100мс для отображения десятых долей
   * - При достижении 0: автоматически вызывает stopTraining()
   *
   * @sideEffects
   * - Обновляет activeTraining, isActive, score, timeLeft, timeTenths
   * - Сбрасывает lastSquare, intervalID, tenthsIntervalID
   * - Генерирует начальную цель
   * - Запускает таймеры (при режиме "timer")
   */
  function startTraining() {
    if (activeColor.value === "random") {
      activeColor.value = Math.random() > 0.5 ? "white" : "black";
      flipped.value = activeColor.value === "black" ? true : false;
    }

    activeTraining.value = true;
    isActive.value = true;
    score.value = 0;
    timeLeft.value = 30;
    timeTenths.value = 0;
    lastSquare.value = "";
    intervalID = 0;
    tenthsIntervalID = 0;
    generateRandomSquare();

    setTimeout(() => {
      if (activeMode.value === "timer") {
        intervalID = setInterval(() => {
          if (timeLeft.value > 0) {
            timeLeft.value--;
          } else {
            isActive.value = false;
            clearInterval(intervalID);
            clearInterval(tenthsIntervalID);
            stopTraining();
          }
        }, 1000);

        tenthsIntervalID = setInterval(() => {
          if (isActive.value && timeLeft.value > 0) {
            if (timeTenths.value > 0) {
              timeTenths.value--;
            } else {
              timeTenths.value = 9;
            }
          }
        }, 100);
      }
    }, 500);
  }

  /**
   * Завершает текущую тренировку
   * @description
   * - Очищает все таймеры (ошибки, игровые)
   * - Сохраняет результат в статистику (только для режима "timer" с score > 0)
   * - Сбрасывает игровые состояния
   * - Не скрывает панель тренировки сразу (пользователь видит финальный счет)
   *
   * @sideEffects
   * - Очищает errorTimer, intervalID, tenthsIntervalID
   * - Сохраняет игру через saveCurrentGame() (если есть результат)
   * - Сбрасывает isActive, targetSquare
   * - Не сбрасывает activeTraining (панель остается видимой)
   */
  function stopTraining() {
    if (errorTimer.value) {
      clearTimeout(errorTimer.value);
      errorTimer.value = null;
    }
    showError.value = false;

    clearInterval(intervalID);
    clearInterval(tenthsIntervalID);

    if (score.value > 0) {
      saveCurrentGame();
    }

    isActive.value = false;
    targetSquare.value = "";
  }

  /**
   * Форматирует время для отображения
   */
  const formattedTime = computed(() => {
    if (activeMode.value !== "timer") return "∞";

    const secondsStr =
      timeLeft.value < 10
        ? timeLeft.value.toString()
        : timeLeft.value.toString().padStart(2, "0");

    return `${secondsStr}.${timeTenths.value}`;
  });

  /**
   * Интерфейс результата игры
   * @interface GameResult
   * @property {number} score - Количество верных кликов в игре
   * @property {'white' | 'black'} color - Цвет фигур, за которые играл пользователь
   * @property {'timer' | 'infinite'} mode - Режим игры
   * @property {Date} [date] - Дата и время окончания игры (опционально)
   */
  interface GameResult {
    score: number;
    color: "white" | "black";
    mode: "timer" | "infinite";
    date?: Date;
  }

  /**
   * История всех сыгранных игр
   * @description
   * - Хранит результаты всех завершенных тренировок
   * - Сохраняется в localStorage под ключом 'chessGameHistory'
   * - Загружается автоматически при инициализации store
   * - Используется для расчета статистики
   */
  const gameHistory = ref<GameResult[]>([]);

  /**
   * Сохраняет текущую игру в историю
   */
  function saveCurrentGame() {
    if (score.value > 0 && activeMode.value === "timer") {
      const result: GameResult = {
        score: score.value,
        color: activeColor.value as "white" | "black",
        mode: activeMode.value as "timer" | "infinite",
        date: new Date(),
      };

      gameHistory.value.push(result);
      localStorage.setItem(
        "chessGameHistory",
        JSON.stringify(gameHistory.value),
      );
    }
  }

  /**
   * Средний результат для белых фигур
   * @returns {number} Среднее арифметическое score по всем играм белыми
   *   - Округлено до целого числа
   *   - 0 если нет игр белыми
   */
  const averageScoreWhite = computed(() => {
    const whiteGames = gameHistory.value.filter(
      (game) => game.color === "white",
    );
    if (whiteGames.length === 0) return 0;
    const total = whiteGames.reduce((sum, game) => sum + game.score, 0);
    return Math.round(total / whiteGames.length);
  });

  /**
   * Средний результат для черных фигур
   * @returns {number} Среднее арифметическое score по всем играм черными
   *   - Округлено до целого числа
   *   - 0 если нет игр черными
   */
  const averageScoreBlack = computed(() => {
    const blackGames = gameHistory.value.filter(
      (game) => game.color === "black",
    );
    if (blackGames.length === 0) return 0;
    const total = blackGames.reduce((sum, game) => sum + game.score, 0);
    return Math.round(total / blackGames.length);
  });

  /**
   * Количество сыгранных игр белыми фигурами
   * @returns {number} Количество записей в gameHistory с color === 'white'
   */
  const whiteGamesCount = computed(
    () => gameHistory.value.filter((game) => game.color === "white").length,
  );

  /**
   * Количество сыгранных игр черными фигурами
   * @returns {number} Количество записей в gameHistory с color === 'black'
   */
  const blackGamesCount = computed(
    () => gameHistory.value.filter((game) => game.color === "black").length,
  );

  /**
   * Лучший результат для белых фигур
   * @returns {number} Максимальный score среди всех игр белыми
   *   - 0 если нет игр белыми
   */
  const bestScoreWhite = computed(() => {
    const whiteGames = gameHistory.value.filter(
      (game) => game.color === "white",
    );
    if (whiteGames.length === 0) return 0;
    return Math.max(...whiteGames.map((game) => game.score));
  });

  /**
   * Лучший результат для черных фигур
   * @returns {number} Максимальный score среди всех игр черными
   *   - 0 если нет игр черными
   */
  const bestScoreBlack = computed(() => {
    const blackGames = gameHistory.value.filter(
      (game) => game.color === "black",
    );
    if (blackGames.length === 0) return 0;
    return Math.max(...blackGames.map((game) => game.score));
  });

  /**
   * Загружает историю игр из localStorage
   * - Читает данные из localStorage по ключу 'chessGameHistory'
   * - Парсит JSON строку в массив объектов
   * - Восстанавливает объекты Date из строк
   * - При ошибках парсинга инициализирует пустым массивом
   *
   * @sideEffects Инициализирует gameHistory.value данными из localStorage
   */
  function loadGameHistory() {
    const saved = localStorage.getItem("chessGameHistory");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        gameHistory.value = data.map((item) => ({
          ...item,
          date: item.date ? new Date(item.date) : new Date(),
        }));
      } catch {
        gameHistory.value = [];
      }
    }
  }

  loadGameHistory();

  return {
    activeMode,
    activeColor,
    flipped,
    showPieces,
    showCoordinates,
    pieces,
    score,
    isActive,
    activeTraining,
    targetSquare,
    nextSquare,
    timeLeft,
    timeTenths,
    formattedTime,
    lastSquare,
    allCoordinates,
    showError,

    averageScoreWhite,
    averageScoreBlack,
    whiteGamesCount,
    blackGamesCount,
    bestScoreWhite,
    bestScoreBlack,

    startTraining,
    stopTraining,
    checkClick,
    generateRandomSquare,
  };
});
