import { ref } from 'vue'
import { useGameStore } from '@/store/gameStore'

export function useDragAndDrop(squareClick) {
  const game = useGameStore()
  const draggedFrom = ref(null)

  /**
   * Начало перетаскивания фигуры
   */
  const handleDragStart = (id, event) => {
    if (game.result.type || game.isReplayMode()) {
      event.preventDefault()
      return 
    }

    const piece = game.pieces[id]
    
    if (!piece) {
      event.preventDefault()
      return
    }

    if (piece[0] !== game.currentTurn) {
      event.preventDefault()
      return
    }
    
    draggedFrom.value = id
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move"
      event.dataTransfer.setData("text/plain", id)
    }
  }

  /**
   * Завершение перетаскивания
   */
  const handleDragEnd = () => {
    draggedFrom.value = null
  }

  /**
   * Обработка drop на клетке
   */
  const handleDrop = (to, event) => {
    event.preventDefault()

    if (game.result.type) {
      draggedFrom.value = null
      return 
    }

    let from = null
    try {
      from = event.dataTransfer?.getData("text/plain") || draggedFrom.value
    } catch (e) {
      console.error("Ошибка при получении dataTransfer:", e)
      from = draggedFrom.value
    }

    if (!from) return

    if (from === to) {
      squareClick.resetSelection()
      draggedFrom.value = null
      return
    }

    const piece = game.pieces[from]
    if (!piece) {
      console.warn("onDrop: нет фигуры на from", from)
      draggedFrom.value = null
      return
    }
    
    if (piece[0] !== game.playerColor) { 
      console.warn("onDrop: пытаются двигать не свою фигуру:", from)
      draggedFrom.value = null
      return
    }

    if (game.currentTurn !== game.playerColor) {
      console.warn("onDrop: сейчас не ваша очередь:", game.currentTurn)
      draggedFrom.value = null
      return
    }

    const avail = game.getAvailableMoves(from)
    if (!avail.has(to)) {
      console.warn(`onDrop: недопустимый ход ${from} → ${to}`)
      draggedFrom.value = null
      squareClick.resetSelection()
      return
    }

    const isPawn = piece && (piece[1] === 'P' || piece[1] === 'p')
    const isPromotionSquare = (to[1] === '8' && piece[0] === 'w') || (to[1] === '1' && piece[0] === 'b')
    
    if (isPawn && isPromotionSquare) {
      // Ход с превращением
      game.promotionMove = {
        from: from,
        to: to,
        piece: piece,
        pending: true
      }
      game.showPromotionModal = true
    } else {
      // Обычный ход
      game.sendMove(from, to)
    }

    squareClick.resetSelection()
    draggedFrom.value = null
  }

  /**
   * Сброс состояния drag & drop
   */
  const resetDrag = () => {
    draggedFrom.value = null
  }

  return {
    draggedFrom,
    
    handleDragStart,
    handleDragEnd,
    handleDrop,
    resetDrag
  }
}