import { defineStore } from "pinia";
import { ref, reactive } from "vue";

export const useGameStore = defineStore("game", () => {
  const pieces = ref({});              // расположение фигур
  const currentTurn = ref("w");        // чей ход ("w" или "b")
  const lastMove = reactive({ from: null, to: null });
  const enPassantTarget = ref(null);   // клетка для взятия на проходе
  const positionHistory = ref([]);     // история позиций
  const result = ref(null);            // результат партии ("1-0", "0-1", "½-½", null)
  const moveCountWithoutAction = ref(0); // счётчик для правила 50 ходов
  const totalMoveCount = ref(0);       // общее число полуходов

  const castlingRights = reactive({
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true, 
    blackQueenSide: true
});
  // --- Actions ---
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

function makeMove(from, to) {
  const movingPiece = pieces.value[from];
  const targetPiece = pieces.value[to] ?? null;

  if (result.value) {
    console.warn('Game finished:', result.value);
    return;
  }

  // базовые проверки
  if (!movingPiece) return;
  if (!isValidMove(from, to, movingPiece)) return;

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
    if (isPawnMove || isCapture) halfmoveClock.value = 0; else halfmoveClock.value += 1;
    totalMoveCount.value += 1;

    lastMove.value = { from, to };
    selectedSquare.value = null;
    currentTurn.value = currentTurn.value === "w" ? "b" : "w";

    positionHistory.value.push(getPositionHash());
    checkGameState(currentTurn.value);
    return;
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
    halfmoveClock.value = 0;
  } else {
    halfmoveClock.value += 1;
  }

  totalMoveCount.value += 1;

  // завершение хода
  lastMove.value = { from, to };
  selectedSquare.value = null;
  currentTurn.value = currentTurn.value === "w" ? "b" : "w";

  // сохраняем позицию  и затем проверяем ничью/повторение
  positionHistory.value.push(getPositionHash());

  if (halfmoveClock.value >= 100) {
    result.value = { type: 'draw', reason: '50-move rule' };
  }

  if (isThreefoldRepetition()) {
    result.value = { type: 'draw', reason: 'threefold repetition' };
  }

  checkGameState(currentTurn.value);
  highlightedSquares.value.clear();
}

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
    setInitialPosition,
    makeMove,
    checkGameState
  };
});
