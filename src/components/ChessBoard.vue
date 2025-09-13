<template>
  <div class="board-wrapper">
    <div class="board">
      <div v-for="(row, rIndex) in squares" :key="rIndex" class="rank-row">
        <div
          v-for="cell in row"
          :key="cell.id"
          class="cell"
          :class="[cell.color, { selected: selectedSquare === cell.id }]"
          @click="onSquareClick(cell.id)"
        >
        <img v-if="pieceImage(cell.id)" :src="pieceImage(cell.id)" class="piece" />

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
import { computed, ref } from "vue";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

const castlingRights = ref({
  whiteKingSide: true,
  whiteQueenSide: true,
  blackKingSide: true,
  blackQueenSide: true,
});

const squares = computed(() =>
  ranks.map((rank, rIdx) =>
    files.map((file, fIdx) => {
      const color = (rIdx + fIdx) % 2 === 0 ? "light" : "dark";
      return { id: `${file}${rank}`, file, rank, color };
    })
  )
);

const pieces = ref({});
/**
 * Устанавливает фигуры в начальную шахматную позицию.
 * Заполняет объект pieces.value кодами фигур:
 * - w = белые, b = чёрные
 * - P = пешка, R = ладья, N = конь, B = слон, Q = ферзь, K = король
 * Пример: "wP" = белая пешка, "bK" = чёрный король.
 */
function setInitialPosition() {
  pieces.value = {
    a8: 'bR', b8: 'bN', c8: 'bB', d8: 'bQ', e8: 'bK', f8: 'bB', g8: 'bN', h8: 'bR',
    a7: 'bP', b7: 'bP', c7: 'bP', d7: 'bP', e7: 'bP', f7: 'bP', g7: 'bP', h7: 'bP',
    a2: 'wP', b2: 'wP', c2: 'wP', d2: 'wP', e2: 'wP', f2: 'wP', g2: 'wP', h2: 'wP',
    a1: 'wR', b1: 'wN', c1: 'wB', d1: 'wQ', e1: 'wK', f1: 'wB', g1: 'wN', h1: 'wR'
  };
}

setInitialPosition();

console.log('initial pieces:', pieces.value);

/**
 * Возвращает путь к картинке фигуры на указанной клетке.
 * @param {string} squareId - id клетки, например "e2".
 * @returns {string|null} путь к svg-файлу или null, если фигуры нет.
 */
function pieceImage(squareId) {
  const code = pieces.value[squareId] // например "wP" или "bK"
  if (!code) return null;

  return new URL(`../assets/chess-pieces/${code}.svg`, import.meta.url).href;
}

const selectedSquare = ref(null) //  например "e2"
const currentTurn = ref("w");

/**
 * Обрабатывает клик по клетке шахматной доски.
 * - Если фигура только выбирается → сохраняет её клетку.
 * - Если фигура уже выбрана → пытается сделать ход.
 * - Проверяет корректность хода через isValidMove().
 * - Переключает ход между белыми и чёрными.
 * @param {string} id - id клетки, по которой кликнули (например "e2").
 */
function onSquareClick(id) {
  if (selectedSquare.value && id === selectedSquare.value) {
    selectedSquare.value = null;
    console.log("Выбор отменён:", id);
    return;
  }

  if(!selectedSquare.value && pieces.value[id]) {
    const piece = pieces.value[id];

    if(piece[0] !== currentTurn.value) {
      console.log("Сейчас не ваш ход!")
      return
    }
    
    selectedSquare.value = id
      console.log("Фигура выбрана", id)
      return
    }

  if(selectedSquare.value) {
    const piece = pieces.value[selectedSquare.value] // например wN

  if (!isValidMove(selectedSquare.value, id, piece)) {
    console.log("Недопустимый ход!");
    selectedSquare.value = null;
    return;
}

    pieces.value[id] = piece

    delete pieces.value[selectedSquare.value];

    console.log(`Фигура ${piece} перемещена из ${selectedSquare.value} в ${id}`);

    selectedSquare.value = null;

    currentTurn.value = currentTurn.value === "w" ? "b" : "w";
  }
}

/**
 * Преобразует id клетки в числовые индексы.
 * Пример: "e2" → { fileIndex: 4, rank: 2 }
 * @param {string} sq - клетка в виде строки (например "e2").
 * @returns {{fileIndex: number, rank: number}}
 */
function parseSquare(sq) {
  const file = sq[0];
  const rank = Number(sq[1]);
  const fileIndex = files.indexOf(file); 
  return { fileIndex, rank };
}

/**
 * Возвращает фигуру, стоящую на указанной клетке.
 * @param {string} square - клетка, например "e2".
 * @returns {string|null} код фигуры ("wP", "bK" и т.п.) или null, если пусто.
 */
function getPieceAt(square) {
  return pieces.value[square] ?? null;
}

/**
 * Проверяет, принадлежат ли две фигуры разным игрокам.
 * @param {string|null} codeA - код первой фигуры ("wP" и т.п.) или null.
 * @param {string|null} codeB - код второй фигуры ("bN" и т.п.) или null.
 * @returns {boolean} true, если это фигуры разных цветов.
 */
function isOpponent(codeA, codeB) {
  if (!codeA || !codeB) return false;
  return codeA[0] !== codeB[0];
}

/**
 * Проверяет, может ли пешка сделать ход с from → to.
 * @param {string} from - клетка, откуда двигается (например, "e2").
 * @param {string} to - клетка назначения (например, "e4").
 * @param {string} piece - код фигуры (например, "wP").
 * @returns {boolean} true, если ход допустим.
 */
function isValidPawnMove(from, to, piece) {
  const { fileIndex: fFile, rank: fRank } = parseSquare(from);
  const { fileIndex: tFile, rank: tRank } = parseSquare(to);

  const dir = piece[0] === "w" ? 1 : -1; // белые идут вверх (rank +1), чёрные вниз (rank -1)
  const startRank = piece[0] === "w" ? 2 : 7;

  if (fFile === tFile && tRank === fRank + dir && !getPieceAt(to)) {
    return true;
  }

  // Пешка идет на 2 поля
  if (
    fFile === tFile &&
    fRank === startRank &&
    tRank === fRank + 2 * dir &&
    !getPieceAt(to) &&
    !getPieceAt(`${files[fFile]}${fRank + dir}`) // промежуточная клетка
  ) {
    return true;
  }

  // взятие по диагонали
  if (
    Math.abs(tFile - fFile) === 1 &&
    tRank === fRank + dir &&
    isOpponent(piece, getPieceAt(to))
  ) {
    return true;
  }

  return false; 
}

/**
 * Проверяет, может ли ладья сделать ход с from → to.
 * @param {string} from - начальная клетка (например, "a1").
 * @param {string} to - конечная клетка (например, "a8").
 * @param {string} piece - код фигуры (например, "wR").
 * @returns {boolean} true, если ход допустим.
 */
function isValidRookMove(from, to) {
  const { fileIndex: fFile, rank: fRank } = parseSquare(from);
  const { fileIndex: tFile, rank: tRank } = parseSquare(to);

  // Ладья должна двигаться строго по прямой линии
  if (fFile !== tFile && fRank !== tRank) {
    return false;
  }

  // Проверяем путь между from и to
  if (fFile === tFile) {
    // вертикальное движение (по rank)
    const step = tRank > fRank ? 1 : -1;
    for (let r = fRank + step; r !== tRank; r += step) {
      if (getPieceAt(`${files[fFile]}${r}`)) {
        return false; // на пути стоит фигура
      }
    }
  } else {
    // горизонтальное движение (по file)
    const step = tFile > fFile ? 1 : -1;
    for (let f = fFile + step; f !== tFile; f += step) {
      if (getPieceAt(`${files[f]}${fRank}`)) {
        return false; // на пути стоит фигура
      }
    }
  }

  // Если дошли сюда → путь чистый, ход разрешён
  return true;
}

/**
 * Проверяет, может ли слон сделать ход с from → to.
 * Слон ходит только по диагонали и не может перепрыгивать через фигуры.
 *
 * @param {string} from - начальная клетка (например, "c1").
 * @param {string} to - конечная клетка (например, "h6").
 * @param {string} piece - код фигуры (например, "wB").
 * @returns {boolean} true, если ход допустим.
 */
function isValidBishopMove(from, to) {
  const {fileIndex: fFile, rank: fRank} = parseSquare(from);
  const {fileIndex: tFile, rank: tRank} = parseSquare(to);

  if(Math.abs(tFile - fFile) !== Math.abs(tRank - fRank)) {
    return false;
  }
  
  const stepFile = tFile > fFile ? 1 : -1
  const stepRank = tRank > fRank ? 1 : -1;

  let f = fFile + stepFile;
  let r = fRank + stepRank;

  while(f !== tFile && r !== tRank) {
    if(getPieceAt(`${files[f]}${r}`)) {
      return false;
    }

    f += stepFile;
    r += stepRank;
  }

  return true;
}

/**
 * Проверяет, может ли король сделать ход с from → to.
 * @param {string} from - начальная клетка (например, "e1").
 * @param {string} to - конечная клетка (например, "e2").
 * @returns {boolean} true, если ход допустим.
 */
function isValidKingMove(from, to) {
  const {fileIndex: fFile, rank: fRank} = parseSquare(from)
  const {fileIndex: tFile, rank: tRank} = parseSquare(to);

  const fileDiff = Math.abs(tFile - fFile);
  const rankDiff = Math.abs(tRank - fRank);

  return (fileDiff <= 1 && rankDiff <= 1) && !(fileDiff === 0 && rankDiff === 0);
}

/**
 * Проверяет, может ли конь сделать ход с from → to.
 * @param {string} from - начальная клетка (например, "g1").
 * @param {string} to - конечная клетка (например, "e2").
 * @param {string} piece - код фигуры (например, "wN").
 * @returns {boolean} true, если ход допустим.
 */
function isValidKnightMove(from, to) {
  const {fileIndex: fFile, rank: fRank} = parseSquare(from);
  const {fileIndex: tFile, rank: tRank} = parseSquare(to);

  const fileDiff = Math.abs(tFile - fFile);
  const rankDiff = Math.abs(tRank - fRank)

  // "Г"-образное движение: (2,1) или (1,2)
  return (fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2);
}

/**
 * Проверяет, может ли ферзь сделать ход с from → to.
 * Ферзь ходит как ладья и как слон.
 *
 * @param {string} from - начальная клетка (например, "d1").
 * @param {string} to - конечная клетка (например, "h5").
 * @param {string} piece - код фигуры (например, "wQ").
 * @returns {boolean} true, если ход допустим.
 */
function isValidQueenMove(from, to) {
  if(isValidRookMove(from, to)) {
    return true;
  }

  if(isValidBishopMove(from, to)) {
    return true;
  }

  return false;
}
/**
  * Отзывает права на рокировку в зависимости от того, кто и откуда ходил.
 * Вызывать после выполнения хода (или в момент, когда известно, что фигура ходила).
 * @param {string} piece - код фигуры, например "wK", "bR"
 * @param {string}from - клетка, с которой сделан ход, например "e1"
 */
function revokeCastlingRightsForMove(piece, from) {
  if(!piece) return;
  const color = piece[0];
  const type = piece[1];

  if(type === "K") {
    if(color === "w") {
      castlingRights.value.whiteKingSide = false;
      castlingRights.value.whiteQueenSide = false;
    } else {
      castlingRights.value.blackKingSide = false;
      castlingRights.value.blackQueenSide = false;
    }
    return;
  }

  if(type === "R") {
    if(color === "w") {
      if(from === "h1") castlingRights.value.whiteKingSide = false;
      if(from === "a1") castlingRights.value.whiteQueenSide = false;
    } else {
      if(from === "h8") castlingRights.value.blackKingSide = false;
      if(from === "a8") castlingRights.value.blackQueenSide = false;
    }
  }
}

/**
 * Отзывает право на рокировку, если была убита ладья на стартовой клетке.
 * Вызывать при обработке захвата: если targetPiece[1] === "R" и targetSquare === одна из начальных позиций — снимаем соответствующее право.
 * @param {string} square - клетка, где стояла (или была захвачена) ладья, например "h1"
 */
function revokeCastlingRightsForSquare(square) {
  if (square === "h1") castlingRights.value.whiteKingSide = false;
  if (square === "a1") castlingRights.value.whiteQueenSide = false;
  if (square === "h8") castlingRights.value.blackKingSide = false;
  if (square === "a8") castlingRights.value.blackQueenSide = false;
}


/**
 * Центральный валидатор ходов для любых фигур.
 * - Запрещает ходить на ту же клетку.
 * - Запрещает рубить свои фигуры.
 * - Делегирует проверку в специализированные функции:
 *   - пешки → isValidPawnMove()
 *   - ладьи → isValidRookMove() (ещё не реализована)
 *   - остальные фигуры будут добавлены позже.
 * @param {string} from - начальная клетка (например "e2").
 * @param {string} to - клетка назначения (например "e4").
 * @param {string} piece - код фигуры (например "wP").
 * @returns {boolean} true, если ход допустим.
 */
function isValidMove(from, to, piece) {
  // Нельзя ходить на ту же самую клетку
  if (from === to) {
    return false;
  }

  const targetPiece = getPieceAt(to);

  // Нельзя рубить свои фигуры
  if (targetPiece && targetPiece[0] === piece[0]) {
    return false;
  }

  // Определяем тип фигуры 
  const type = piece[1];

  if (type === "P") {
    return isValidPawnMove(from, to, piece);
  }

  if (type === "R") {
  
    return isValidRookMove(from, to, piece);
  }

  if(type === "B") {
    return isValidBishopMove(from, to, piece)
  }

  if(type === "Q") {
    return isValidQueenMove(from, to, piece)
  }

  if(type === "K") {
    return isValidKingMove(from, to, piece)
  }

  if(type === "N") {
    return isValidKnightMove(from, to, piece)
  }

  return true;
}
</script>

<style>
.board-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px;
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
  width: clamp(20px, 4vw, 32px); /* цифры тоже адаптивные */
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-left: 2px;
}

.cell {
  width: clamp(40px, 8vw, 64px);   /* клетка адаптивная */
  height: clamp(40px, 8vw, 64px);
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
  width: clamp(40px, 8vw, 64px); /* ширина равна клетке */
  text-align: center;
  font-weight: 600;
}

.piece {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none; /* фигура не мешает клику */
}

.cell.selected {
  border: 3px solid red;
}

</style>
