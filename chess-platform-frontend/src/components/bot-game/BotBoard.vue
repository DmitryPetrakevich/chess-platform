<template>
  <div class="board-wrapper">
    <div ref="boardEl" class="chessground-board"></div>

    <PromotionModal
      v-if="game.showPromotionModal && game.promotionMove"
      :color="game.promotionMove.piece[0]"
      @select="handlePromotionSelect"
      @cancel="handlePromotionCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, computed } from "vue";
import { Chessground } from "chessground";
import { useGameStore } from "@/store/gameStore";
import { useBotGameStore } from "@/store/gameBotStore";
import type { Square } from "chess.js";
import type { Key } from "chessground/types";

import PromotionModal from "../game/PromotionModal.vue";

const game = useGameStore();
const botGame = useBotGameStore();

const boardEl = ref<HTMLElement | null>(null);
let chessground: any = null;

const destCache = new Map<string, Map<Key, Key[]>>();

let syncQueued = false;
let lastSyncedFen = "";

const isFlipped = computed(() => botGame.playerColor === "b");

function getOrientation() {
  return isFlipped.value ? "black" : "white";
}

function getTurnColor() {
  return game.currentTurn === "w" ? "white" : "black";
}

function getMovableColor() {
  if (!botGame.isGameStarted) return undefined;
  if (game.result.type) return undefined;
  if (game.currentTurn !== botGame.playerColor) return undefined;

  return botGame.playerColor === "w" ? "white" : "black";
}

function getLastMove() {
  if (game.lastMove?.from && game.lastMove?.to) {
    return [game.lastMove.from, game.lastMove.to];
  }
  return undefined;
}

function isCheck() {
  return game.chess.inCheck();
}

function getDests() {
  const fen = game.fen;
  const cached = destCache.get(fen);
  if (cached) return cached;

  const dests = new Map<Key, Key[]>();

  if (!botGame.isGameStarted || game.result.type) {
    destCache.set(fen, dests);
    return dests;
  }

  if (game.currentTurn !== botGame.playerColor) {
    destCache.set(fen, dests);
    return dests;
  }

  const board = game.chess.board();
  const files = ["a","b","c","d","e","f","g","h"];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece || piece.color !== botGame.playerColor) continue;

      const square = `${files[col]}${8 - row}` as Key;

      const moves = game.chess.moves({ square, verbose: true });

      if (moves.length) {
        dests.set(
          square,
          moves.map((m) => m.to as Key)
        );
      }
    }
  }

  destCache.set(fen, dests);
  return dests;
}

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
    check: isCheck() ? getTurnColor() : undefined,
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

function scheduleSyncBoard() {
  if (!chessground || syncQueued) return;

  syncQueued = true;
  requestAnimationFrame(() => {
    syncQueued = false;
    syncBoard();
  });
}

async function initBoard() {
  if (chessground) return;
  if (!boardEl.value) return;

  await nextTick();

  if (!boardEl.value || chessground) return;

  chessground = Chessground(boardEl.value, {
    fen: game.fen,
    orientation: getOrientation(),
    turnColor: getTurnColor(),
    lastMove: getLastMove(),
    check: isCheck() ? getTurnColor() : undefined,
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
}

const handleMove = (orig: string, dest: string) => {
  if (game.result.type) return false;
  if (!botGame.isGameStarted) return false;
  if (game.currentTurn !== botGame.playerColor) return false;

  const piece = game.chess.get(orig as Square);

  if (!piece) return false;

  const isPawn = piece.type === "p";

  const isPromotionSquare =
    (dest[1] === "8" && piece.color === "w") ||
    (dest[1] === "1" && piece.color === "b");

  if (isPawn && isPromotionSquare) {
    game.promotionMove = {
      from: orig,
      to: dest,
      piece: piece.color + piece.type.toUpperCase(),
      pending: true,
    };

    game.showPromotionModal = true;
    scheduleSyncBoard();
    return false;
  }

  const success = botGame.onPlayerMove(orig, dest);

  if (!success) {
    scheduleSyncBoard();
    return false;
  }

  destCache.clear();
  scheduleSyncBoard();
  return true;
};

const handlePromotionSelect = async (piece: string) => {
  if (!game.promotionMove) return;

  const { from, to } = game.promotionMove;

  game.promotionMove = null;
  game.showPromotionModal = false;

  const success = botGame.onPlayerMove(from, to, piece);

  if (!success) {
    lastSyncedFen = "";
    scheduleSyncBoard();
    return;
  }

  await nextTick();
  botGame.makeBotMove();
};

const handlePromotionCancel = () => {
  game.promotionMove = null;
  game.showPromotionModal = false;

  lastSyncedFen = "";
  scheduleSyncBoard();
};

onMounted(initBoard);

watch(
  () => [botGame.isGameStarted, botGame.playerColor],
  async () => {
    await initBoard();
    scheduleSyncBoard();
  },
  { immediate: true }
);

watch(
  () => [game.fen, game.currentTurn, game.lastMove.from, game.lastMove.to, game.result.type],
  () => {
    destCache.clear();
    scheduleSyncBoard();
  },
  { immediate: true, flush: "post" }
);

watch(
  () => botGame.isBotThinking,
  scheduleSyncBoard
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
.board-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.chessground-board {
  width: 100%;
  max-width: 650px;
  aspect-ratio: 1 / 1;
}
</style>