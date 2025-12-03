<template>
  <div class="board-wrapper">
    <div class="board">
      <div v-for="(row, rIndex) in squares" :key="rIndex" class="rank-row">
        <div 
          v-for="cell in row" 
          :key="cell.id" 
          class="cell"
          :class="[
            cell.color, 
            { selected: selectedSquare === cell.id },
            { highlighted: highlightedSquares.has(cell.id) },
            { 'last-move': game.lastMove.from === cell.id || game.lastMove.to === cell.id }
          ]"
          @click="onSquareClick(cell.id)"
          @dragover.prevent
          @drop="onDrop(cell.id, $event)" 
        >
          <img v-if="pieceImage(cell.id)" 
            :src="pieceImage(cell.id)" 
            class="piece" 
            draggable="true"
            @dragstart="onDragStart(cell.id, $event)" 
            @dragend="onDragEnd"
          />
        </div>
        <div class="rank-label">
          {{ row[0].rank }}
        </div>
      </div>

      <div class="files-row">
        <div v-for="f in files" :key="f" class="file-label">{{ f }}</div>
        <div class="rank-label"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from "@/store/gameStore";
import { computed, ref, onMounted, nextTick , watch } from "vue"; 

const game = useGameStore();

const flipped = computed(() => game.playerColor === "b");

/**
 * ID клетки, которая в данный момент выбрана (выделена) пользователем.
 * Используется для отслеживания выбранной фигуры перед выполнением хода.
 * 
 * @example "e2" - выбрана клетка e2
 * @example null - нет выбранной клетки
 * 
 * @usage
 * // При клике на фигуру:
 * selectedSquare.value = "e2"
 * 
 * // После выполнения хода:
 * selectedSquare.value = null
 */
const selectedSquare = ref(null) 
/**
 * Множество клеток, которые должны быть подсвечены как доступные для хода.
 * Содержит ID клеток, куда может переместиться выбранная фигура.
 * 
 * @example Set {"e3", "e4"} - пешка на e2 может пойти на e3 и e4
 * @example Set {} - нет доступных ходов или фигура не выбрана
 * 
 * @usage
 * // При выборе фигуры:
 * highlightedSquares.value = new Set(["e3", "e4"])
 * 
 * // При сбросе выбора:
 * highlightedSquares.value.clear()
 * 
 * @see getAvailableMoves - функция, которая заполняет это множество
 */
const highlightedSquares = ref(new Set()); 
/**
 * Клетка, с которой начали перетаскивание.
 * @type {import('vue').Ref<string|null>}
 * Используется как запасной источник информации о начальной клетке,
 * если event.dataTransfer не содержит данных (разные браузеры/платформы).
 */
const draggedFrom = ref(null); 

const files = computed(() =>
  flipped.value ? ["h","g","f","e","d","c","b","a"] : ["a","b","c","d","e","f","g","h"]
);
const ranks = computed(() =>
  flipped.value ? [1,2,3,4,5,6,7,8] : [8,7,6,5,4,3,2,1]
);

const squares = computed(() =>
  ranks.value.map((rank, rIdx) =>
    files.value.map((file, fIdx) => {
      const color = (rIdx + fIdx) % 2 === 0 ? "light" : "dark";
      return { id: `${file}${rank}`, file, rank, color };
    })
  )
);

 game.setInitialPosition();

/**
 * Возвращает путь к картинке фигуры на указанной клетке.
 * @param {string} squareId - id клетки, например "e2".
 * @returns {string|null} путь к svg-файлу или null, если фигуры нет.
 */
function pieceImage(squareId) {
  const code = game.pieces[squareId] // например "wP" или "bK"
  if (!code) return null;

  return new URL(`../assets/chess-pieces/${code}.svg`, import.meta.url).href;
}

/**
 * Обрабатывает клик по клетке шахматной доски.
 * - Если фигура только выбирается → сохраняет её клетку.
 * - Если фигура уже выбрана → пытается сделать ход.
 * - Проверяет корректность хода через isValidMove().
 * - Переключает ход между белыми и чёрными.
 * @param {string} id - id клетки, по которой кликнули (например "e2").
 */
function onSquareClick(id) {
  if (game.result.type) return;
  const clickedPiece = game.pieces[id];

  if (clickedPiece && clickedPiece[0] === game.currentTurn) {
    if (selectedSquare.value === id) {
      selectedSquare.value = null;
      highlightedSquares.value.clear();
    } else {
      selectedSquare.value = id;
      highlightedSquares.value = game.getAvailableMoves(id);
    }
    return;
  }

  if (selectedSquare.value && highlightedSquares.value.has(id)) {
    game.sendMove(selectedSquare.value, id);
    selectedSquare.value = null;
    highlightedSquares.value.clear();
  } else {
    selectedSquare.value = null;
    highlightedSquares.value.clear();
  }
}

/**
 * Начало перетаскивания фигуры.
 * Что делает:
 * - Проверяет, есть ли фигура на клетке и принадлежит ли она игроку, который сейчас ходит.
 *   Если нет — отменяет перетаскивание (event.preventDefault()).
 * - Сохраняет исходную клетку в draggedFrom (запасной источник).
 * - Кладёт id клетки в event.dataTransfer (тип "text/plain") — это облегчает
 *   получение исходной клетки в обработчике drop в разных браузерах.
 * - Устанавливает event.dataTransfer.effectAllowed = "move".
 *
 * @param {string} id - id клетки-источника (например "e2").
 * @param {DragEvent} event - объект события dragstart.
 */
function onDragStart(id, event) {
  if (game.result.type) {
  event.preventDefault();
  return; 
}

  const piece = game.pieces[id];
  
  if (!piece) {
    event.preventDefault();
    return;
  }

  if (piece[0] !== game.currentTurn) {
    event.preventDefault();
    return;
  }
  
  draggedFrom.value = id;
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  }
}

/**
 * Завершение перетаскивания (dragend).
 * Просто очищает временное состояние (draggedFrom).
 *
 * @param {DragEvent} [event] - объект события dragend (не обязателен).
 */
function onDragEnd() {
  draggedFrom.value = null;
}

/**
 * Обработчик drop на клетке-приёмнике.
 *
 * Шаги:
 * - Предотвращает дефолтное поведение браузера (event.preventDefault()).
 * - Пытается извлечь исходную клетку (from) из event.dataTransfer (text/plain).
 * - Если dataTransfer пуст или недоступен — использует запасную draggedFrom.
 * - Если from определена — вызывает makeMove(from, to).
 * - В конце очищает draggedFrom.
 *
 * @param {string} to - id клетки-приёмника (например "e4").
 * @param {DragEvent} event - объект события drop.
 */
function onDrop(to, event) {
  event.preventDefault();

  if (game.result.type) {
  draggedFrom.value = null;
  return; 
}

  let from = null;
  try {
    from = event.dataTransfer?.getData("text/plain") || draggedFrom.value;
  } catch (e) {
    console.error("Ошибка при получении dataTransfer:", e);
    from = draggedFrom.value;
  }

  if (!from) return;

  if (from === to) {
    selectedSquare.value = null;
    highlightedSquares.value.clear();
    draggedFrom.value = null;
    return;
  }

  const piece = game.pieces[from];
  if (!piece) {
    console.warn("onDrop: нет фигуры на from", from);
    draggedFrom.value = null;
    return;
  }
  if (piece[0] !== game.playerColor) { // игрок пытается двигать чужую фигуру
    console.warn("onDrop: пытаются двигать не свою фигуру:", from);
    draggedFrom.value = null;
    return;
  }

  if (game.currentTurn !== game.playerColor) {
    console.warn("onDrop: сейчас не ваша очередь:", game.currentTurn);
    draggedFrom.value = null;
    return;
  }

  const avail = game.getAvailableMoves(from);
  if (!avail.has(to)) {
    console.warn(`onDrop: недопустимый ход ${from} → ${to}`);
    draggedFrom.value = null;
    selectedSquare.value = null;
    highlightedSquares.value.clear();
    return;
  }

  game.sendMove(from, to);

  selectedSquare.value = null;
  highlightedSquares.value.clear();
  draggedFrom.value = null;
}

watch(() => game.result.type, (newResult) => {
  if (newResult) {
    selectedSquare.value = null;
    highlightedSquares.value.clear();
    draggedFrom.value = null;
  }
})
</script>

<style>
.board-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.board {
  display: inline-block;
  user-select: none;
  max-width: min(80vh, 1000px);
  max-height: min(80vh, 1000px);
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1; 
}

.rank-row {
  display: flex;
  align-items: stretch;
  height: calc(100% / 8); 
}

.cell {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  cursor: pointer;
  flex: 1;
  aspect-ratio: 1 / 1;
}

.rank-label {
  width: clamp(20px, 3vw, 30px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-left: 2px;
  font-size: clamp(12px, 2vw, 16px);
}

.file-label {
  width: 100%;
  text-align: center;
  font-weight: 600;
  font-size: clamp(12px, 2vw, 16px);
  height: clamp(20px, 3vw, 30px);
}

.piece {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 2px; 
}

.cell.light {
  background: #f0d9b5;
}

.cell.dark {
  background: #b58863;
}

.files-row {
  display: flex;
  align-items: center;
  height: clamp(20px, 3vw, 30px);
}

.cell.highlighted {
  position: relative; 
}

.cell.highlighted::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30%;          
  height: 30%;
  background: rgba(136, 168, 136, 0.4); 
  border-radius: 50%;  
  transform: translate(-50%, -50%); 
  pointer-events: none; 
  z-index: 1;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
}

.cell.dark.highlighted::after {
  background: rgba(180, 200, 180, 0.45); 
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.549);
}

.cell.selected {
  box-sizing: border-box;
  background-color: rgba(67, 94, 67, 0.4);
}

.cell.selected.highlighted {
  background: inherit !important;
}

.cell.last-move {
  background: rgba(255, 255, 0, 0.435) !important; 
}

.board.flipped {
  transform: rotate(180deg);
}

.board.flipped .piece,
.board.flipped .file-label,
.board.flipped .rank-label {
  transform: rotate(180deg);
}

@media (max-width: 768px) {
  .board-wrapper {
    padding: 0;
  }

  .board {
    max-width: min(70vh, 1000px);
    max-height: min(70vh, 1000px);
}
}
</style>
