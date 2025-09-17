<template>
  <div class="board-wrapper">
    <div class="board">
      <div v-for="(row, rIndex) in squares" :key="rIndex" class="rank-row">
        <div v-for="cell in row" :key="cell.id" class="cell"
          :class="[cell.color, { selected: selectedSquare === cell.id }]" @click="onSquareClick(cell.id)">
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

const selectedSquare = ref(null) //  например "e2"
const currentTurn = ref("w");
const enPassantSquare = ref(null); // "d6", "e3" или null

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

  // pieces.value = {
  //   a1: "wK", a2: "wP", a8: "bK"
  // };
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

/**
 * Обрабатывает клик по клетке шахматной доски.
 * - Если фигура только выбирается → сохраняет её клетку.
 * - Если фигура уже выбрана → пытается сделать ход.
 * - Проверяет корректность хода через isValidMove().
 * - Переключает ход между белыми и чёрными.
 * @param {string} id - id клетки, по которой кликнули (например "e2").
 */
function onSquareClick(id) {
  const clickedPiece = pieces.value[id];

  if (clickedPiece && clickedPiece[0] === currentTurn.value) {
    selectedSquare.value = id;
    return;
  }

  if (!selectedSquare.value) return;

  const from = selectedSquare.value;
  const to = id;
  const movingPiece = pieces.value[from];
  const targetPiece = pieces.value[to] ?? null;

  if (!isValidMove(from, to, movingPiece)) {
    console.log("Недопустимый ход!");
    selectedSquare.value = null;
    return;
  }

  const dir = movingPiece[0] === "w" ? 1 : -1;

  // Рокировка
  if (isCastlingMove(from, to, movingPiece)) {
    pieces.value[to] = movingPiece;
    delete pieces.value[from];

    if (to === "g1") { pieces.value["f1"] = "wR"; delete pieces.value["h1"]; }
    if (to === "c1") { pieces.value["d1"] = "wR"; delete pieces.value["a1"]; }
    if (to === "g8") { pieces.value["f8"] = "bR"; delete pieces.value["h8"]; }
    if (to === "c8") { pieces.value["d8"] = "bR"; delete pieces.value["a8"]; }

    revokeCastlingRightsForMove(movingPiece, from);
    selectedSquare.value = null;
    currentTurn.value = currentTurn.value === "w" ? "b" : "w";
    checkGameState(currentTurn.value);
    return;
  }

  //  взятия на проходе
  if (movingPiece[1] === "P") {
    // проверяем, было ли это взятие на проходе
    if (to === enPassantSquare.value && !targetPiece) {
      const capturedPawnSquare = `${files[parseSquare(to).fileIndex]}${parseSquare(to).rank - dir}`;
      delete pieces.value[capturedPawnSquare];
    }

    // если пешка двигается на 2 клетки, устанавливаем en passant
    if (Math.abs(parseSquare(to).rank - parseSquare(from).rank) === 2) {
      enPassantSquare.value = `${files[parseSquare(from).fileIndex]}${parseSquare(from).rank + dir}`;
    } else {
      enPassantSquare.value = null;
    }
  } else {
    enPassantSquare.value = null; // любое другое движение сбрасывает en passant
  }

  // Захват или обычный ход
  if (targetPiece && targetPiece[1] === "R") revokeCastlingRightsForSquare(to);

  pieces.value[to] = movingPiece;
  delete pieces.value[from];

  if (movingPiece[1] === "P") {
    const toRank = parseSquare(to).rank;

    // Для белых пешек достижение 8-й линии
    if (movingPiece[0] === "w" && toRank === 8) {
      pieces.value[to] = "wQ";
    }

    // Для чёрных пешек достижение 1-й линии
    if (movingPiece[0] === "b" && toRank === 1) {
      pieces.value[to] = "bQ";
    }
  }

  revokeCastlingRightsForMove(movingPiece, from);

  selectedSquare.value = null;
  currentTurn.value = currentTurn.value === "w" ? "b" : "w";

  checkGameState(currentTurn.value);
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
  if (Math.abs(tFile - fFile) === 1 && tRank === fRank + dir && isOpponent(piece, getPieceAt(to))) {
    return true;
  }
  if (to === enPassantSquare.value) return true;

  return false;
}

/**
 * Проверяет, находится ли король указанного цвета `color` под шахом.
 * 
 * @param {"w"|"b"} color - Цвет короля, которого проверяем: "w" или "b".
 * @param {Object<string,string>} [board=pieces.value] - Объект с расстановкой фигур.
 * @returns {boolean} true, если король цвета `color` атакуется хотя бы одной фигурой противника.
 * @throws {Error} Если король не найден на доске.
 */
function isKingInCheck(color, board = pieces.value) {
  const opponent = color === "w" ? "b" : "w";
  let kingSquare = Object.keys(board).find(sq => board[sq] === `${color}K`);
  if (!kingSquare) throw new Error(`Король цвета ${color} не найден!`);
  return isSquareAttacked(kingSquare, opponent, board);
}

/**
 * Проверяет, есть ли хотя бы один допустимый ход для игрока,
 * учитывая шахи на временной доске.
 * @param {string} color - цвет игрока ("w" или "b")
 * @param {object} board - текущая доска { square: piece }
 * @returns {boolean} true, если есть хотя бы один допустимый ход
 */
function hasAnyValidMoves(color, board = pieces.value) {
  for (const from in board) {
    const piece = board[from];
    if (!piece || piece[0] !== color) continue;

    for (const file of files) {
      for (const rank of ranks) {
        const to = `${file}${rank}`;
        const targetPiece = board[to];
        if (targetPiece && targetPiece[0] === color) continue;

        // проверяем движение по правилам фигуры
        let valid = false;
        switch (piece[1]) {
          case "P": valid = isValidPawnMove(from, to, piece); break;
          case "R": valid = isValidRookMove(from, to, piece); break;
          case "B": valid = isValidBishopMove(from, to, piece); break;
          case "Q": valid = isValidQueenMove(from, to, piece); break;
          case "N": valid = isValidKnightMove(from, to, piece); break;
          case "K": valid = isValidKingMove(from, to, piece) || isCastlingMove(from, to, piece); break;
        }
        if (!valid) continue;

        // делаем временный ход на копии доски
        const tempBoard = { ...board };
        tempBoard[to] = piece;
        delete tempBoard[from];

        // проверяем, не под шахом ли король
        if (!isKingInCheck(color, tempBoard)) {
          return true; // хотя бы один ход есть
        }
      }
    }
  }
  return false; // ходов нет
}

/**
 * Проверяет, находится ли игрок в состоянии мата или пата.
 * @param {string} color - цвет игрока ("w" или "b")
 * @returns {"checkmate"|"stalemate"|null}
 */
function checkMateOrStalemate(color) {
  const inCheck = isKingInCheck(color);
  const hasMoves = hasAnyValidMoves(color);

  if (!hasMoves && inCheck) return "checkmate";
  if (!hasMoves && !inCheck) return "stalemate";
  return null;
}

/**
 * Проверяет состояние игры после хода.
 * @param {string} color - цвет, который должен ходить следующим ("w" или "b").
 */
function checkGameState(color) {
  const state = checkMateOrStalemate(color);

  if (state === "checkmate") {
    console.log(`Мат! Победил игрок ${color === "w" ? "черными" : "белыми"}.`);
    return true;
  }

  if (state === "stalemate") {
    console.log("Пат! Ничья.");
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
    // вертикальное движение 
    const step = tRank > fRank ? 1 : -1;
    for (let r = fRank + step; r !== tRank; r += step) {
      if (getPieceAt(`${files[fFile]}${r}`)) {
        return false; // на пути стоит фигура
      }
    }
  } else {
    // горизонтальное движение 
    const step = tFile > fFile ? 1 : -1;
    for (let f = fFile + step; f !== tFile; f += step) {
      if (getPieceAt(`${files[f]}${fRank}`)) {
        return false; // на пути стоит фигура
      }
    }
  }

  // путь чистый
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
  const { fileIndex: fFile, rank: fRank } = parseSquare(from);
  const { fileIndex: tFile, rank: tRank } = parseSquare(to);

  if (Math.abs(tFile - fFile) !== Math.abs(tRank - fRank)) {
    return false;
  }

  const stepFile = tFile > fFile ? 1 : -1
  const stepRank = tRank > fRank ? 1 : -1;

  let f = fFile + stepFile;
  let r = fRank + stepRank;

  while (f !== tFile && r !== tRank) {
    if (getPieceAt(`${files[f]}${r}`)) {
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
  const { fileIndex: fFile, rank: fRank } = parseSquare(from)
  const { fileIndex: tFile, rank: tRank } = parseSquare(to);

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
  const { fileIndex: fFile, rank: fRank } = parseSquare(from);
  const { fileIndex: tFile, rank: tRank } = parseSquare(to);

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
  if (isValidRookMove(from, to)) {
    return true;
  }

  if (isValidBishopMove(from, to)) {
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
  if (!piece) return;
  const color = piece[0];
  const type = piece[1];

  if (type === "K") {
    if (color === "w") {
      castlingRights.value.whiteKingSide = false;
      castlingRights.value.whiteQueenSide = false;
    } else {
      castlingRights.value.blackKingSide = false;
      castlingRights.value.blackQueenSide = false;
    }
    return;
  }

  if (type === "R") {
    if (color === "w") {
      if (from === "h1") castlingRights.value.whiteKingSide = false;
      if (from === "a1") castlingRights.value.whiteQueenSide = false;
    } else {
      if (from === "h8") castlingRights.value.blackKingSide = false;
      if (from === "a8") castlingRights.value.blackQueenSide = false;
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

function isSquareAttacked(square, byColor, board = pieces.value) {
  const { fileIndex: tFile, rank: tRank } = parseSquare(square);

  // Пешка
  if (byColor === "w") {
    if (tFile - 1 >= 0 && board[`${files[tFile - 1]}${tRank - 1}`] === "wP") return true;
    if (tFile + 1 <= 7 && board[`${files[tFile + 1]}${tRank - 1}`] === "wP") return true;
  } else {
    if (tFile - 1 >= 0 && board[`${files[tFile - 1]}${tRank + 1}`] === "bP") return true;
    if (tFile + 1 <= 7 && board[`${files[tFile + 1]}${tRank + 1}`] === "bP") return true;
  }

  // Конь
  const knightMoves = [
    [1, 2], [2, 1], [-1, 2], [-2, 1],
    [1, -2], [2, -1], [-1, -2], [-2, -1]
  ];
  for (const [df, dr] of knightMoves) {
    const f = tFile + df;
    const r = tRank + dr;
    if (f < 0 || f > 7 || r < 1 || r > 8) continue;
    if (board[`${files[f]}${r}`] === `${byColor}N`) return true;
  }

  // Ладья/слон/ферзь
  const rookDirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const bishopDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

  const checkSliding = (dirs, attackers) => {
    for (const [df, dr] of dirs) {
      let f = tFile + df;
      let r = tRank + dr;
      while (f >= 0 && f <= 7 && r >= 1 && r <= 8) {
        const sq = `${files[f]}${r}`;
        const p = board[sq];
        if (p) {
          if (p[0] === byColor && attackers.includes(p[1])) return true;
          break;
        }
        f += df;
        r += dr;
      }
    }
    return false;
  };

  if (checkSliding(rookDirs, ["R", "Q"])) return true;
  if (checkSliding(bishopDirs, ["B", "Q"])) return true;

  // Король
  for (let df = -1; df <= 1; df++) {
    for (let dr = -1; dr <= 1; dr++) {
      if (df === 0 && dr === 0) continue;
      const f = tFile + df;
      const r = tRank + dr;
      if (f < 0 || f > 7 || r < 1 || r > 8) continue;
      if (board[`${files[f]}${r}`] === `${byColor}K`) return true;
    }
  }

  return false;
}

/**
 * Проверяет, является ли ход короля рокировкой, и разрешена ли она в текущей позиции.
 * @param {string} from - начальная клетка (например "e1" или "e8")
 * @param {string} to - конечная клетка (например "g1", "c1", "g8", "c8")
 * @param {string} piece - строка фигуры вида "wK" или "bK"
 * @returns {boolean} true, если ход является корректной рокировкой
 */
function isCastlingMove(from, to, piece) {
  if (!piece || piece[1] !== "K") return false;

  const { fileIndex: fFile, rank: fRank } = parseSquare(from);
  const { fileIndex: tFile, rank: tRank } = parseSquare(to);

  // рокировка — только по той же горизонтали и ровно на 2 клетки
  if (fRank !== tRank || Math.abs(tFile - fFile) !== 2) return false;

  const color = piece[0];
  const opponent = color === "w" ? "b" : "w";

  // белые
  if (color === "w") {
    if (from !== "e1") return false;

    // короткая
    if (to === "g1") {
      if (!castlingRights.value.whiteKingSide) return false;
      if (getPieceAt("h1") !== "wR") return false;
      if (getPieceAt("f1") || getPieceAt("g1")) return false;

      if (isSquareAttacked("e1", opponent)) return false;
      if (isSquareAttacked("f1", opponent)) return false;
      if (isSquareAttacked("g1", opponent)) return false;

      return true;
    }

    // длинная
    if (to === "c1") {
      if (!castlingRights.value.whiteQueenSide) return false;
      if (getPieceAt("a1") !== "wR") return false;
      if (getPieceAt("d1") || getPieceAt("c1") || getPieceAt("b1")) return false;

      if (isSquareAttacked("e1", opponent)) return false;
      if (isSquareAttacked("d1", opponent)) return false;
      if (isSquareAttacked("c1", opponent)) return false;

      return true;
    }
    return false;
  }

  // чёрные
  if (color === "b") {
    if (from !== "e8") return false;

    if (to === "g8") {
      if (!castlingRights.value.blackKingSide) return false;
      if (getPieceAt("h8") !== "bR") return false;
      if (getPieceAt("f8") || getPieceAt("g8")) return false;

      if (isSquareAttacked("e8", opponent)) return false;
      if (isSquareAttacked("f8", opponent)) return false;
      if (isSquareAttacked("g8", opponent)) return false;

      return true;
    }

    if (to === "c8") {
      if (!castlingRights.value.blackQueenSide) return false;
      if (getPieceAt("a8") !== "bR") return false;
      if (getPieceAt("d8") || getPieceAt("c8") || getPieceAt("b8")) return false;

      if (isSquareAttacked("e8", opponent)) return false;
      if (isSquareAttacked("d8", opponent)) return false;
      if (isSquareAttacked("c8", opponent)) return false;

      return true;
    }
    return false;
  }
  return false;
}

/**
 * Проверяет, может ли фигура сделать ход с from → to формально.
 * - Не проверяет шах.
 * - Не проверяет пат/мат.
 * @param {string} from - начальная клетка, например "e2"
 * @param {string} to - конечная клетка, например "e4"
 * @param {string} piece - код фигуры, например "wP"
 * @returns {boolean} true, если формально ход допустим
 */
function isValidMove(from, to, piece) {
  if (!piece) return false;

  if (from === to) return false;
  const targetPiece = getPieceAt(to);
  if (targetPiece && targetPiece[0] === piece[0]) return false;

  let valid = false;
  switch (piece[1]) {
    case "P": valid = isValidPawnMove(from, to, piece); break;
    case "R": valid = isValidRookMove(from, to, piece); break;
    case "B": valid = isValidBishopMove(from, to, piece); break;
    case "Q": valid = isValidQueenMove(from, to, piece); break;
    case "N": valid = isValidKnightMove(from, to, piece); break;
    case "K": valid = isValidKingMove(from, to, piece) || isCastlingMove(from, to, piece); break;
  }

  if (!valid) return false;

  // король не должен оставаться под шахом
  const tempBoard = { ...pieces.value };
  tempBoard[to] = piece;
  delete tempBoard[from];

  if (piece[1] !== "K") {
    const kingSquare = Object.keys(tempBoard).find(sq => tempBoard[sq] === `${piece[0]}K`);
    if (isSquareAttacked(kingSquare, piece[0] === "w" ? "b" : "w", tempBoard)) {
      return false; // король под шахом после этого хода
    }
  } else {
    if (isSquareAttacked(to, piece[0] === "w" ? "b" : "w", tempBoard)) {
      return false;
    }
  }

  return true; // ход разрешён
}
</script>

<style>
.board-wrapper {
  display: flex;
  justify-content: center;
  /* align-items: center; */
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
  width: clamp(20px, 4vw, 32px);
  /* цифры тоже адаптивные */
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-left: 2px;
}

.cell {
  /* width: clamp(50px, 10vw, 80px);  
  height: clamp(50px, 10vw, 80px);  */
  width: clamp(35px, 7vw, 60px);
  height: clamp(35px, 7vw, 60px);
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
  width: clamp(40px, 8vw, 64px);
  /* ширина равна клетке */
  text-align: center;
  font-weight: 600;
}

.piece {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  /* фигура не мешает клику */
}

.cell.selected {
  border: 3px solid red;
}
</style>
