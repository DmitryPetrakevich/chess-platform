<template>
  <div ref="boardEl" class="chessground-board"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Chessground } from 'chessground'
import { useGameStore } from '@/store/gameStore'

const game = useGameStore()

const boardEl = ref<HTMLElement | null>(null)
let chessground: any = null

const destCache = new Map<string, Map<string, string[]>>()
let syncQueued = false
let lastSyncedFen = ''

function getOrientation() {
  return game.playerColor === 'b' ? 'black' : 'white'
}

function getMovableColor() {
  if (game.currentTurn !== game.playerColor) return undefined
  return game.playerColor === 'w' ? 'white' : 'black'
}

function getLastMove() {
  if (game.lastMove?.from && game.lastMove?.to) {
    return [game.lastMove.from, game.lastMove.to]
  }
  return undefined
}

function getDests() {
  const fen = game.fen
  const cached = destCache.get(fen)
  if (cached) return cached

  const dests = new Map() as any

  if (game.currentTurn !== game.playerColor) {
    destCache.set(fen, dests)
    return dests
  }

  const moves = game.chess.moves({ verbose: true })

  for (const move of moves) {
    if (!dests.has(move.from)) {
      dests.set(move.from, [])
    }
    dests.get(move.from).push(move.to)
  }

  destCache.set(fen, dests)
  return dests
}

function syncBoard() {
  if (!chessground) return

  const fen = game.fen
  if (fen === lastSyncedFen) return
  lastSyncedFen = fen

  chessground.set({
    fen,
    orientation: getOrientation(),
    turnColor: game.currentTurn === 'w' ? 'white' : 'black',
    lastMove: getLastMove(),
    movable: {
      free: false,
      color: getMovableColor(),
      dests: getDests(),
      events: {
        after: handleMove,
      },
    },
  })
}

function scheduleSyncBoard() {
  if (!chessground || syncQueued) return

  syncQueued = true
  requestAnimationFrame(() => {
    syncQueued = false
    syncBoard()
  })
}

async function initBoard() {
  if (chessground) return
  if (!boardEl.value) return
  if (!game.playerColor || !game.currentRoomId) return

  await nextTick()

  if (!boardEl.value || chessground) return

  chessground = Chessground(boardEl.value, {
    fen: game.fen,
    orientation: getOrientation(),
    turnColor: game.currentTurn === 'w' ? 'white' : 'black',
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
    highlight: {
      lastMove: true,
      check: true,
    },
    animation: {
      enabled: true,
      duration: 180,
    },
  })

  lastSyncedFen = ''
  syncBoard()
}

const handleMove = (orig: string, dest: string) => {
  if (game.result.type) return false

  if (!game.currentRoomId) {
    console.error('Нет currentRoomId')
    return false
  }

  if (game.currentTurn !== game.playerColor) {
    return false
  }

  const success = game.makeMove(orig, dest)

  if (!success) {
    scheduleSyncBoard()
    return false
  }

  game.sendMove(orig, dest)

  destCache.clear()
  scheduleSyncBoard()

  return true
}

onMounted(() => {
  initBoard()
})

watch(
  () => [game.playerColor, game.currentRoomId],
  async () => {
    await initBoard()
  },
  { immediate: true }
)

watch(
  () => game.fen,
  () => {
    scheduleSyncBoard()
  },
  { immediate: true, flush: 'post' }
)

onBeforeUnmount(() => {
  if (chessground) {
    chessground.destroy()
    chessground = null
  }
  destCache.clear()
  syncQueued = false
  lastSyncedFen = ''
})
</script>

<style scoped>
.chessground-board {
  width: 100%;
  max-width: 620px;
  aspect-ratio: 1 / 1;
}
</style>