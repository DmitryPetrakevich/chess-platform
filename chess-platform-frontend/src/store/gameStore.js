import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";
import { useTimerStore } from "./timerStore";

export const useGameStore = defineStore("game", () => {

const timerStore = useTimerStore(); 

  /**
   * Расположение фигур на доске
   */
  const pieces = ref({});
  /**
   * Очередь хода ("w" или "b")
   */              
  const currentTurn = ref("w");
  /**
 * Информация о последнем выполненном ходе.
 * @property {string|null} from - начальная клетка хода (например "e2")
 * @property {string|null} to - конечная клетка хода (например "e4")
 */        
  const lastMove = ref({ from: null, to: null });
  /**
 * Клетка, доступная для взятия на проходе (en passant).
 * Устанавливается когда пешка делает ход на 2 клетки вперёд.
 */
  const enPassantTarget = ref(null);
  /**
 * История позиций для отслеживания повторений.
 * Содержит хэши позиций для проверки правила трёхкратного повторения.
 */   
  const positionHistory = ref([]);
  /**
 * Результат партии. null - игра продолжается.
 * @example { type: 'draw', reason: '50-move rule' }
 * @example { type: 'checkmate', winner: 'w' }
 */     
  const result = ref(null);
  /**
 * Счётчик ходов без взятия фигур и движения пешек.
 * Используется для правила 50 ходов.
 */            
  const moveCountWithoutAction = ref(0);
  /**
 * Общее количество полуходов в партии.
 * Увеличивается после каждого хода (белых или чёрных).
 */ 
  const totalMoveCount = ref(0);
 /**
 * Текущий цвет игрока ("w" или "b")
 * Устанавливается сервером при подключении к комнате
 * @type {import('vue').Ref<"w"|"b"|null>}
 */
const playerColor = ref(null)
/**
 * Цвет оппонента (удобно для проверок)
 * Вычисляется автоматически на основе playerColor
 */
const opponentColor = computed(() => (playerColor.value === "w" ? "b" : "w"))
/**
 * Идентификатор текущей игровой комнаты
 */
const currentRoomId = ref(null); 

const opponent = ref({
    id: null,
    username: "Opponent",
    blitzRating: 1200
});

  function setOpponent(data) {
    opponent.value = {
      id: data.id,
      username: data.username,
      blitzRating: data.blitz_rating ?? 1200
    };
  }

/**
 * Устанавливает цвет игрока 
 * @param {"w"|"b"} color - Цвет фигур игрока
 */
function setPlayerColor(color) {
  console.log("🎨 setPlayerColor:", color);
  playerColor.value = color;
}

/**
 * Устанавливает очередь хода
 * @param {"w"|"b"} turn - Чья очередь ходить
 */
  function setCurrentTurn(turn) {
    currentTurn.value = turn;
  }

  function resetBoard() {
    console.log("♻️ Сброс доски (реализуй, если нужно)");
  }

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  /**
 * Права на рокировку для обеих сторон.
 * @property {boolean} whiteKingSide - рокировка белых в короткую сторону (O-O)
 * @property {boolean} whiteQueenSide - рокировка белых в длинную сторону (O-O-O)
 * @property {boolean} blackKingSide - рокировка чёрных в короткую сторону (O-O)
 * @property {boolean} blackQueenSide - рокировка чёрных в длинную сторону (O-O-O)
 */
  const castlingRights = reactive({
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true, 
    blackQueenSide: true
});

/**
 * Устанавливает начальную позицию фигур на шахматной доске.
 */
function setInitialPosition() {
  pieces.value = {
    a8: 'bR', b8: 'bN', c8: 'bB', d8: 'bQ', e8: 'bK', f8: 'bB', g8: 'bN', h8: 'bR',
    a7: 'bP', b7: 'bP', c7: 'bP', d7: 'bP', e7: 'bP', f7: 'bP', g7: 'bP', h7: 'bP',
    a2: 'wP', b2: 'wP', c2: 'wP', d2: 'wP', e2: 'wP', f2: 'wP', g2: 'wP', h2: 'wP',
    a1: 'wR', b1: 'wN', c1: 'wB', d1: 'wQ', e1: 'wK', f1: 'wB', g1: 'wN', h1: 'wR'
  };

  // pieces.value = {
  //   a5: "wK", b5: "wP", a8: "bK", a4: "wB"
  // };
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
 * Проверяет, атакована ли указанная клетка фигурами определённого цвета.
 * @param {string} square - Клетка, которую проверяем (например, "e4").
 * @param {"w"|"b"} byColor - Цвет атакующих фигур ("w" для белых, "b" для чёрных).
 * @param {Object} [board=pieces.value] - Текущее состояние доски
 *   в формате объекта { "e4": "wP", ... }. По умолчанию берётся глобальное `pieces.value`.
 * @returns {boolean} true — если клетка атакована хотя бы одной фигурой указанного цвета,
 *                    false — если клетка безопасна.
 * Если находится фигура нужного типа и цвета — возвращается true.
 */
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

  /**
   * Проверяет, атакуется ли целевая клетка фигурами дальнобойного типа 
   * (ладья, слон или ферзь), двигающимися по заданным направлениям.
   *
   * @param {number[][]} dirs - Массив направлений движения в формате [df, dr].
   * @param {string[]} attackers - Список типов фигур (по обозначению),
   *   которые могут атаковать по этим направлениям, например ["R","Q"] или ["B","Q"].
   * @returns {boolean} true, если в каком-либо направлении найдена фигура `attackers` цвета `byColor`,
   *   которая может атаковать целевую клетку; иначе false.
   */
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
 * Выполняет ход фигуры с одной клетки на другую.
 * Проверяет валидность хода, обрабатывает специальные правила (рокировка, en passant, превращение пешки),
 * обновляет состояние игры и проверяет конечные состояния (мат, пат, ничья).
 * 
 * @param {string} from - Начальная клетка хода (например "e2")
 * @param {string} to - Конечная клетка хода (например "e4")
 */
function makeMove(from, to) {
  const movingPiece = pieces.value[from];
  const targetPiece = pieces.value[to] ?? null;

  if (result.value) {
    console.warn('Game finished:', result.value);
    return false;
  }

  // базовые проверки
  if (!movingPiece) return false;
  const availableMoves = getAvailableMoves(from);
  if (!availableMoves.has(to)) {
    console.warn(`🚫 Недопустимый ход: ${from} → ${to}`);
    return false; 
  }

  // вычисляем флаги ДО изменения доски
  const isPawnMove = movingPiece[1] === "P";
  const isEnPassantCapture = isPawnMove && (to === enPassantTarget.value) && !targetPiece;
  const isCapture = Boolean(targetPiece) || isEnPassantCapture;

  // рокировка
  if (isCastlingMove(from, to, movingPiece)) {
    pieces.value[to] = movingPiece;
    delete pieces.value[from];

    if (to === "g1") { pieces.value["f1"] = "wR"; delete pieces.value["h1"]; }
    if (to === "c1") { pieces.value["d1"] = "wR"; delete pieces.value["a1"]; }
    if (to === "g8") { pieces.value["f8"] = "bR"; delete pieces.value["h8"]; }
    if (to === "c8") { pieces.value["d8"] = "bR"; delete pieces.value["a8"]; }

    revokeCastlingRightsForMove(movingPiece, from);

    // обновляем счётчики и историю
    if (isPawnMove || isCapture) moveCountWithoutAction.value = 0; else moveCountWithoutAction.value += 1;
    totalMoveCount.value += 1;

    lastMove.value = { from, to };
    currentTurn.value = currentTurn.value === "w" ? "b" : "w";

    positionHistory.value.push(getPositionHash());
    checkGameState(currentTurn.value);
    return true;
  }

  // обработка en-passant
  if (isEnPassantCapture) {
    const dir = movingPiece[0] === "w" ? 1 : -1;
    const fileIndex = parseSquare(to).fileIndex;
    const capturedPawnSquare = `${files[fileIndex]}${parseSquare(to).rank - dir}`;
    // удаляем захваченную пешку
    delete pieces.value[capturedPawnSquare];
  }

  // обновление enPassantTarget (для двойного шага пешки)
  if (isPawnMove && Math.abs(parseSquare(to).rank - parseSquare(from).rank) === 2) {
    // средняя клетка между from и to
    const midRank = (parseSquare(from).rank + parseSquare(to).rank) / 2;
    enPassantTarget.value = `${files[parseSquare(from).fileIndex]}${midRank}`;
  } else {
    enPassantTarget.value = null;
  }

  // если бьем ладью — лишаем прав на рокировку
  if (targetPiece && targetPiece[1] === "R") revokeCastlingRightsForSquare(to);

  pieces.value[to] = movingPiece;
  delete pieces.value[from];

  // превращение пешки 
  if (isPawnMove) {
    const toRank = parseSquare(to).rank;
    if (movingPiece[0] === "w" && toRank === 8) pieces.value[to] = "wQ";
    if (movingPiece[0] === "b" && toRank === 1) pieces.value[to] = "bQ";
  }

  // лишаем прав на рокировку если делал ход король/ладья
  revokeCastlingRightsForMove(movingPiece, from);

  // обновляем halfmove clock (правило 50 ходов)
  if (isPawnMove || isCapture) {
    moveCountWithoutAction.value = 0;
  } else {
    moveCountWithoutAction.value += 1;
  }

  totalMoveCount.value += 1;

  // завершение хода
  lastMove.value = { from, to };
  currentTurn.value = currentTurn.value === "w" ? "b" : "w";

  // сохраняем позицию  и затем проверяем ничью/повторение
  positionHistory.value.push(getPositionHash());

  if (moveCountWithoutAction.value >= 100) {
    result.value = { type: 'draw', reason: '50-move rule' };
  }

  if (isThreefoldRepetition()) {
    result.value = { type: 'draw', reason: 'threefold repetition' };
  }

  checkGameState(currentTurn.value);
  return true;
}

/**
 * Проверяет текущее состояние игры для указанного цвета.
 * Определяет мат, пат, ничьи по различным правилам (50 ходов, троекратное повторение, недостаток материала).
 * 
 * @param {"w"|"b"} color - Цвет игрока, для которого проверяется состояние
 * @returns {string|null} Результат проверки или null если игра продолжается
 * 
 * @example
 * checkGameState("w") // "checkmate" - мат белым
 * checkGameState("b") // "stalemate" - пат чёрным  
 * checkGameState("w") // "fifty-move-rule" - ничья по правилу 50 ходов
 */
function checkGameState(color) {
  const state = checkMateOrStalemate(color);

  if(isFiftyMoveRule()) {
    console.log("Ничья по правилу 50 ходов")
    return "fifty-move-rule";
  }

  if (isThreefoldRepetition()) {
    console.log("Ничья по правилу троекратного повторения");
    return "threefold-repetition";
  }

  if (isInsufficientMaterial(pieces.value)) {
    console.log("Ничья, недостаточно материала для постановки мата")
    return "insufficient-material";
  }
  if (state === "checkmate") {
    console.log(`Мат! Победил игрок ${color === "w" ? "черными" : "белыми"}.`);
    return "checkmate"; 
  }

  if (state === "stalemate") {
    console.log("Пат! Ничья.");
    return "stalemate"; 
  }

  return null;
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
 * Проверяет, достигнуто ли правило 50 ходов
 * @returns {boolean} true если ничья по правилу 50 ходов
 */
function isFiftyMoveRule() {
  return moveCountWithoutAction.value >= 100;
}

/**
 * Проверяет, повторилась ли позиция 3 раза
 */
function isThreefoldRepetition() {
  const currentHash = getPositionHash();
  let count = 0;
  
  for (const pastHash of positionHistory.value) {
    if (pastHash === currentHash) {
      count++;
    }
  }
  
  return count >= 3;
}

function isInsufficientMaterial(pieces) {
  const others = Object.values(pieces).filter(p => p[1].toLowerCase() !== 'k');

  if (others.length === 0) return true; // король против короля

  if (others.length === 1) {
    const f = others[0][1].toLowerCase();
    if (f === 'b' || f === 'n') return true; // слон или конь против короля
  }

  if (others.length === 2) {
    const [f1, f2] = others.map(f => f[1].toLowerCase());

    if (f1 === 'n' && f2 === 'n') return true; // два коня
    if (f1 === 'b' && f2 === 'b') {
      // здесь проверка цвета клеток слонов
    }
  }

  return false;
}

/**
 * Создает простой "отпечаток" текущей позиции
 */
function getPositionHash() {
  const pieceArray = []; 
  for (const square in pieces.value) {
    pieceArray.push(`${square}${pieces.value[square]}`);
  }

  pieceArray.sort();

  // Учитываем очередь хода
  let hash = pieceArray.join('|') + '|' + currentTurn.value;

  // Учитываем права на рокировку
  hash += '|CR:' + JSON.stringify(castlingRights);

  // Учитываем en passant
  hash += '|EP:' + (enPassantTarget.value ?? '-');

  return hash;
}

/**
 * Отзывает право на рокировку, если была убита ладья на стартовой клетке.
 * Вызывать при обработке захвата: если targetPiece[1] === "R" и targetSquare === одна из начальных позиций — снимаем соответствующее право.
 * @param {string} square - клетка, где стояла (или была захвачена) ладья, например "h1"
 */
function revokeCastlingRightsForSquare(square) {
  if (square === "h1") castlingRights.whiteKingSide = false;
  if (square === "a1") castlingRights.whiteQueenSide = false;
  if (square === "h8") castlingRights.blackKingSide = false;
  if (square === "a8") castlingRights.blackQueenSide = false;
}

/**
 * Проверяет состояние игры после хода.
 * @param {string} color - цвет, который должен ходить следующим ("w" или "b").
 */
function checkGameState(color) {
  const state = checkMateOrStalemate(color);

  if(isFiftyMoveRule()) {
    console.log("Ничья по правилу 50 ходов")
    return "fifty-move-rule";
  }

  if (isThreefoldRepetition()) {
    console.log("Ничья по правилу троекратного повторения");
    return "threefold-repetition";
  }

  if (isInsufficientMaterial(pieces.value)) {
    console.log("Ничья, недостаточно материала для постановки мата")
    return "insufficient-material";
  }
  if (state === "checkmate") {
    console.log(`Мат! Победил игрок ${color === "w" ? "черными" : "белыми"}.`);
    return "checkmate"; 
  }

  if (state === "stalemate") {
    console.log("Пат! Ничья.");
    return "stalemate"; 
  }

  return null;
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
      if (!castlingRights.whiteKingSide) return false;
      if (getPieceAt("h1") !== "wR") return false;
      if (getPieceAt("f1") || getPieceAt("g1")) return false;

      if (isSquareAttacked("e1", opponent)) return false;
      if (isSquareAttacked("f1", opponent)) return false;
      if (isSquareAttacked("g1", opponent)) return false;

      return true;
    }

    // длинная
    if (to === "c1") {
      if (!castlingRights.whiteQueenSide) return false;
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
      if (!castlingRights.blackKingSide) return false;
      if (getPieceAt("h8") !== "bR") return false;
      if (getPieceAt("f8") || getPieceAt("g8")) return false;

      if (isSquareAttacked("e8", opponent)) return false;
      if (isSquareAttacked("f8", opponent)) return false;
      if (isSquareAttacked("g8", opponent)) return false;

      return true;
    }

    if (to === "c8") {
      if (!castlingRights.blackQueenSide) return false;
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
      castlingRights.whiteKingSide = false;
      castlingRights.whiteQueenSide = false;
    } else {
      castlingRights.blackKingSide = false;
      castlingRights.blackQueenSide = false;
    }
    return;
  }

  if (type === "R") {
    if (color === "w") {
      if (from === "h1") castlingRights.whiteKingSide = false;
      if (from === "a1") castlingRights.whiteQueenSide = false;
    } else {
      if (from === "h8") castlingRights.blackKingSide = false;
      if (from === "a8") castlingRights.blackQueenSide = false;
    }
  }
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

  if (Math.abs(tFile - fFile) === 1 && 
      tRank === fRank + dir && 
      to === enPassantTarget.value) {
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

  return true;
}

/**
 * Возвращает множество доступных ходов для выбранной фигуры на доске.
 * @param {string} squareId - ID клетки в формате "буква+цифра" (например, "e2").
 * @returns {Set<string>} Множество клеток (например, {"e3", "e4"}), куда можно походить выбранной фигурой.
 */
function getAvailableMoves(squareId) {
  const moves = new Set();
  const piece = pieces.value[squareId];
  if (!piece || piece[0] !== currentTurn.value) return moves;

  for (const file of files) {
    for (const rank of ranks) {
      const targetSquare = `${file}${rank}`;
      if (isValidMove(squareId, targetSquare, piece)) {
        moves.add(targetSquare);
      }
    }
  }
  return moves;
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

  return true; 
}

// --- WebSocket подключение --- //
let ws = null;
const playersCount = ref(0);
const shouldRedirect = ref(null);  

/**
 * Подключается к серверу WebSocket и слушает события.
 * @param {string} roomId - ID комнаты (например "game123")
 */
function connectToServer(roomId = "game123", color = null, name = "Player") {
  if (ws && ws.readyState === WebSocket.OPEN && ws.roomId === roomId) return;

  if (ws) {
    try { ws.close(); } catch (e) { /* ignore */ }
    ws = null;
  }

  ws = new WebSocket("ws://localhost:3000");
  ws.roomId = roomId;

  ws.onopen = () => {
    console.log("✅ WebSocket подключен (client)");
    console.log("🎨 Отправляю данные на сервер:", { roomId, color, name });
    ws.send(JSON.stringify({ type: "join", roomId, name, color }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("📩 Сообщение от сервера:", data);

    switch (data.type) {
      case "joined":
        console.log("🎯 Игрок успешно присоединился:", data);
        setPlayerColor(data.color);
        currentRoomId.value = data.roomId;
        playersCount.value = data.playersCount;
        resetBoard();
        break;

      case "start_game":
        console.log("🚀 Игра начинается!", data);
        shouldRedirect.value = {
          roomId: data.roomId,
          reason: "game_started"
        };
        playersCount.value = 2; 
        if (data.turn) setCurrentTurn(data.turn);

          // СБРОС/ИНИЦИАЛИЗАЦИЯ времен (если сервер передаёт — используй их)
        if (data.timers && typeof data.timers.white === "number") {
          timerStore.setTimes(data.timers.white, data.timers.black);
        } else {
          timerStore.reset(5); // или взять формат из data.timeControl
        }

        // Запуск pre-start: 10 секунд до первого хода.
        timerStore.startPreStart(10, () => {
          console.log("⏱ Pre-start истёк — отменяем партию");
          // 1) локально отмечаем результат/отмену
          result.value = { type: "cancelled", reason: "no_move_in_time" };
          // 2) опционально — сообщаем серверу, чтобы и второй клиент узнал:
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "cancel_game", roomId: currentRoomId.value, reason: "no_move" }));
          }
        });

        break;

      case "player_joined":
        console.log("👤 В комнату вошёл игрок:", data);
        playersCount.value += 1;
        setOpponent(data.player);
        break;

      case "moveMade":
        console.log("♟ Подтверждён ход:", data.from, "→", data.to);

          // Если был pre-start — отменяем его и стартуем основные таймеры (first move)
        if (timerStore.preSeconds > 0) {
          timerStore.cancelPreStart();
          // старт основного таймера за цвет, чей ход теперь (data.turn содержит следующий ход)
          // Мы хотим запустить таймер за того, кто сейчас ходит (data.turn)
          if (data.turn) {
            timerStore.start(data.turn);
          } else {
            // если сервер вернул nextTurn в другом поле — попробуй setCurrentTurn и потом start
            if (currentTurn.value) timerStore.start(currentTurn.value);
          }
        }

        makeMove(data.from, data.to);  // теперь только после подтверждения
        if (data.turn) setCurrentTurn(data.turn);
        break;

      case "move":
        console.log("♟ Ход от другого игрока:", data.move);
        makeMove(data.move.from, data.move.to);
        if (data.turn) setCurrentTurn(data.turn);
        break;

      case "error":
        console.warn("❌ Ошибка от сервера:", data.message);
        // Можно добавить визуальное уведомление или popup
        break;

      case "player_left":
        console.log("🚪 Игрок покинул комнату:", data);
        playersCount.value = Math.max(0, playersCount.value - 1);
        break;

      default:
        console.warn("⚙️ Неизвестный тип сообщения:", data.type);
    }
  };

  ws.onclose = () => {
    console.log("❌ WebSocket закрыт");
    ws = null;
  };

  ws.onerror = (err) => {
    console.error("⚠️ Ошибка WebSocket:", err);
  };
}


/**
 * Отправляет ход на сервер.
 */
function sendMove(from, to) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    const moveData = {
      type: "make_move",            
      roomId: currentRoomId.value,  
      move: { from, to }            
    };
    ws.send(JSON.stringify(moveData));
    console.log("📤 Отправил на сервер ход:", moveData);
  } else {
    console.warn("⚠️ Невозможно отправить ход — WebSocket не подключён");
  }
}

  function disconnect() {
    if (!ws) return;
    try { ws.close(); } catch (e) { /* ignore */ }
    ws = null;
  }

  return {
    pieces,
    currentTurn,
    lastMove,
    castlingRights,
    enPassantTarget,
    positionHistory,
    result,
    moveCountWithoutAction,
    totalMoveCount,
    opponentColor,
    playersCount, 
    shouldRedirect, 
    playerColor,
    opponent,
    setInitialPosition,
    makeMove,
    checkGameState,
    getAvailableMoves,
    connectToServer,
    sendMove,
    disconnect,
    setPlayerColor,
    setOpponent,
  };
});
