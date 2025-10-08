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
import { computed, ref, onMounted, onBeforeUnmount } from "vue"; 
import { useRoute } from "vue-router"; 

const game = useGameStore();
const route = useRoute();

onMounted(() => {
  const roomId = route.params.roomId;
  if(roomId) {
    game.connectToServer(roomId);
  } 
});

onBeforeUnmount(() => {
  if (game.disconnect) game.disconnect();
})

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
const draggedFrom = ref(null); // клетка, с которой начали перетаскивать

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

const squares = computed(() =>
  ranks.map((rank, rIdx) =>
    files.map((file, fIdx) => {
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
  const clickedPiece = game.pieces[id];

  highlightedSquares.value.clear();

  if (clickedPiece && clickedPiece[0] === game.currentTurn) {
    selectedSquare.value = id;
    highlightedSquares.value = game.getAvailableMoves(id);
    return;
  }

  if (!selectedSquare.value) return;

  game.makeMove(selectedSquare.value, id);
  game.sendMove(selectedSquare.value, id);
}

/**
 * Начало перетаскивания фигуры.
 *
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
  const piece = game.pieces[id];
  
  if (!piece || piece[0] !== game.currentTurn) {
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
  event.preventDefault(); // Важно: предотвращаем поведение по умолчанию
  let from = null;
  
  try {
    if (event.dataTransfer) {
      from = event.dataTransfer.getData("text/plain");
    }
  } catch (e) {
    console.error("Ошибка при получении данных:", e);
  }
  
  if (!from) {
    from = draggedFrom.value;
  }
  
  if (!from) {
    return;
  }
    
  game.makeMove(from, to);
  game.sendMove(from, to);

  selectedSquare.value = null;
  highlightedSquares.value.clear();

  draggedFrom.value = null;
}
</script>

<style>
.board-wrapper {
  display: flex;
  justify-content: center;
  min-height: 100vh;
}

.board {
  display: inline-block;
  user-select: none;
}

.rank-row {
  display: flex;
  align-items: stretch;
}

.rank-label {
  /* width: clamp(20px, 4vw, 32px); */
  width: clamp(22px, 4.5vw, 35px);    
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-left: 2px;
}

.cell {
  /* width: clamp(35px, 7vw, 60px);
  height: clamp(35px, 7vw, 60px); */
  width: clamp(45px, 8vw, 70px);
  height: clamp(45px, 8vw, 70px);
  box-sizing: border-box;
  cursor: pointer;
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
  margin-top: 6px;
}

.file-label {
  /* width: clamp(40px, 8vw, 64px); */
  width: clamp(45px, 8vw, 70px); 
  text-align: center;
  font-weight: 600;
}

.piece {
  width: 100%;
  height: 100%;
  object-fit: contain;
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
  /* border: 3px solid red; */
  box-sizing: border-box;
  background-color: rgba(67, 94, 67, 0.4);;
  /* background: inherit !important;  */
}

.cell.selected.highlighted {
  background: inherit !important;
}

.cell.last-move {
  background: rgba(255, 255, 0, 0.435) !important; 
}

</style>
