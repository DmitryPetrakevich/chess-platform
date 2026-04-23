<template>
  <div ref="boardEl" class="chessground-board"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, computed } from "vue";
import { Chessground } from "chessground";
import { useGameStore } from "@/store/gameStore";
import { useBotGameStore } from "@/store/gameBotStore";

const game = useGameStore();
const botGame = useBotGameStore();

/**
 * Ссылка на DOM-элемент, в который будет инициализирован Chessground.
 * Используется как контейнер для отрисовки шахматной доски.
 */
const boardEl = ref<HTMLElement | null>(null);
/**
 * Инстанс библиотеки Chessground.
 * Через него происходит управление доской:
 * - обновление позиции (set)
 * - уничтожение (destroy)
 */
let chessground: any = null;
/**
 * Кэш возможных ходов (dests) для каждой позиции (FEN).
 *
 * Ключ: строка FEN текущей позиции
 * Значение: Map, где:
 *   key   — клетка (например "e2")
 *   value — массив возможных ходов (["e3", "e4"])
 *
 * Используется для:
 * - оптимизации (не пересчитывать ходы каждый раз)
 * - снижения нагрузки при ререндере доски
 */
const destCache = new Map<string, Map<string, string[]>>();
/**
 * Флаг, указывающий, что обновление доски уже запланировано.
 *
 * Используется для:
 * - предотвращения множественных вызовов syncBoard в одном кадре
 * - оптимизации через requestAnimationFrame
 */
let syncQueued = false;
/**
 * Последняя позиция (FEN), которая была применена к доске.
 *
 * Используется для:
 * - предотвращения лишнего обновления Chessground
 * - сравнения текущей позиции с предыдущей
 */
let lastSyncedFen = "";
/**
 * Флаг переворота доски.
 *
 * true  — игрок играет за чёрных (доска перевёрнута)
 * false — игрок играет за белых
 *
 * Используется для определения orientation в Chessground
 */
const isFlipped = computed(() => botGame.playerColor === "b");

/**
 * Возвращает ориентацию доски для Chessground.
 *
 * "white" - стандартный вид (белые снизу)
 * 
 * "black" - перевёрнутая доска (чёрные снизу)
 */
function getOrientation() {
  return isFlipped.value ? "black" : "white";
}
/**
 * Возвращает текущий цвет хода в формате, понятном Chessground.
 *
 * Преобразует:
 * - "w" в "white"
 * - "b" в "black"
 */
function getTurnColor() {
  return game.currentTurn === "w" ? "white" : "black";
}
/**
 * Определяет, какой стороне разрешено двигать фигуры на доске.
 *
 * Возвращает:
 * - "white" / "black" - если сейчас ход игрока
 * - undefined - если:
 *    - игра не начата
 *    - игра завершена
 *    - сейчас ход бота
 */
function getMovableColor() {
  if (!botGame.isGameStarted) return undefined;
  if (game.result.type) return undefined;
  if (game.currentTurn !== botGame.playerColor) return undefined;

  return botGame.playerColor === "w" ? "white" : "black";
}
/**
 * Возвращает последний сделанный ход в формате [from, to].
 *
 * Используется для:
 * - подсветки последнего хода на доске
 *
 * Если данных о ходе нет - возвращает undefined
 */
function getLastMove() {
  if (game.lastMove?.from && game.lastMove?.to) {
    return [game.lastMove.from, game.lastMove.to];
  }
  return undefined;
}
/**
 * Вычисляет возможные ходы (dests) для текущей позиции.
 *
 * Возвращает Map:
 *   - key   - клетка (например "e2")
 *   - value - массив допустимых ходов (["e3", "e4"])
 *
 * Оптимизации:
 * - использует кэш (destCache) по FEN
 * - избегает повторных вычислений
 *
 * Логика:
 * 1. Если игра не начата или закончена → нет ходов
 * 2. Если сейчас не ход игрока → нет ходов
 * 3. Иначе:
 *    - проходим по всей доске
 *    - берём только фигуры игрока
 *    - получаем ходы через chess.js
 *
 * Используется Chessground для:
 * - подсветки доступных клеток
 * - ограничения допустимых ходов
 */
function getDests() {
  const fen = game.fen;
  const cached = destCache.get(fen);
  if (cached) return cached;

  const dests = new Map<string, string[]>();

  if (!botGame.isGameStarted || game.result.type) {
    destCache.set(fen, dests);
    return dests;
  }

  if (game.currentTurn !== botGame.playerColor) {
    destCache.set(fen, dests);
    return dests;
  }

  const board = game.chess.board();
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece || piece.color !== botGame.playerColor) continue;

      const square = `${files[col]}${8 - row}`;
      const moves = game.chess.moves({ square, verbose: true });

      if (moves.length) {
        dests.set(
          square,
          moves.map((m) => m.to),
        );
      }
    }
  }

  destCache.set(fen, dests);
  return dests;
}
/**
 * Синхронизирует состояние Chessground с текущим состоянием игры.
 *
 * Обновляет:
 * - позицию (fen)
 * - ориентацию
 * - доступные ходы
 * - подсветку
 *
 * Оптимизация:
 * - если FEN не изменился → обновление не выполняется
 *
 * Это центральная функция обновления UI доски.
 */
function syncBoard() {
  if (!chessground) return;

  const fen = game.fen;
  if (fen === lastSyncedFen) return;
  lastSyncedFen = fen;

  chessground.set({
    fen,
    orientation: getOrientation(),
    turnColor: getTurnColor(),
    lastMove: getLastMove(),
    movable: {
      free: false,
      color: getMovableColor(),
      dests: getDests(),
      events: {
        after: handleMove,
      },
    },

      premovable: {
        enabled: true,
        showDests: true,
    },
    highlight: {
      lastMove: true,
      check: true,
    },
    animation: {
      enabled: true,
      duration: 180,
    },
  });
}
/**
 * Планирует обновление доски через requestAnimationFrame.
 *
 * Зачем нужно:
 * - сгруппировать несколько обновлений в один кадр
 * - избежать лишних перерисовок
 *
 * Работает как "debounce" для рендера доски.
 */
function scheduleSyncBoard() {
  if (!chessground || syncQueued) return;

  syncQueued = true;
  requestAnimationFrame(() => {
    syncQueued = false;
    syncBoard();
  });
}
/**
 * Создаёт и настраивает Chessground
 *
 * Что делает:
 * - Проверяет, что доска ещё не создана
 * - Ждёт появления DOM (nextTick)
 * - Инициализирует Chessground с текущим состоянием игры
 * - Настраивает ходы, ориентацию, анимации и события
 * - Синхронизирует доску (syncBoard)
 *
 * Когда вызывается:
 * - при старте игры
 * - при монтировании компонента
 */
async function initBoard() {
  if (chessground) return;
  if (!boardEl.value) return;
  if (!botGame.isGameStarted || !botGame.playerColor) return;

  await nextTick();

  if (!boardEl.value || chessground) return;

  chessground = Chessground(boardEl.value, {
    fen: game.fen,
    orientation: getOrientation(),
    turnColor: getTurnColor(),
    lastMove: getLastMove(),
    movable: {
      free: false,
      color: getMovableColor(),
      dests: getDests(),
      events: {
        after: handleMove,
      },
    },
    draggable: {
      enabled: true,
      showGhost: true,
    },
    premovable: {
        enabled: true,
        showDests: true,
    },
    highlight: {
      lastMove: true,
      check: true,
    },
    animation: {
      enabled: true,
      duration: 180,
    },
  });

  lastSyncedFen = "";
  syncBoard();
  console.log("Bot Chessground инициализирован");
}
/**
 * Обрабатывает ход игрока из UI
 *
 * @param orig - откуда
 * @param dest - куда
 *
 * Что делает:
 * - Проверяет, можно ли ходить
 * - Передаёт ход в store (onPlayerMove)
 * - Если ошибка → откатывает UI
 * - Если успех → обновляет доску
 *
 * @returns boolean — успешен ли ход
 */
const handleMove = (orig: string, dest: string) => {
  if (game.result.type) return false;
  if (!botGame.isGameStarted) return false;
  if (game.currentTurn !== botGame.playerColor) return false;

  const success = botGame.onPlayerMove(orig, dest);

  if (!success) {
    scheduleSyncBoard();
    return false;
  }

  destCache.clear();
  scheduleSyncBoard();
  return true;
};

onMounted(() => {
  initBoard();
});

watch(
  () => [botGame.isGameStarted, botGame.playerColor],
  async () => {
    await initBoard();
    scheduleSyncBoard();
  },
  { immediate: true },
);

watch(
  () => [game.fen, game.currentTurn, game.lastMove.from, game.lastMove.to, game.result.type],
  () => {
    destCache.clear();
    scheduleSyncBoard();
  },
  { immediate: true, flush: "post" },
);

watch(
  () => botGame.isBotThinking,
  () => {
    scheduleSyncBoard();
  },
);

onBeforeUnmount(() => {
  if (chessground) {
    chessground.destroy();
    chessground = null;
  }

  destCache.clear();
  syncQueued = false;
  lastSyncedFen = "";
});
</script>

<style>
.chessground-board {
  width: 100%;
  max-width: 620px;
  aspect-ratio: 1 / 1;
}
</style>