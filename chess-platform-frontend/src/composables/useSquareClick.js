import { ref, computed, watch } from 'vue'
import { useGameStore } from '@/store/gameStore'

export function useSquareClick() {
  const game = useGameStore()
  
  const selectedSquare = ref(null)
  const highlightedSquares = ref(new Set())

  const handleSquareClick = (id) => {
    if (game.result.type) return
    if (game.showPromotionModal) return
    if (game.isReplayMode()) return

    const clickedPiece = game.pieces[id]

    // Клик по своей фигуре
    if (clickedPiece && clickedPiece[0] === game.currentTurn) {
      if (selectedSquare.value === id) {
        // Снимаем выделение
        selectedSquare.value = null
        highlightedSquares.value.clear()
      } else {
        // Выбираем новую фигуру
        selectedSquare.value = id
        highlightedSquares.value = game.getAvailableMoves(id)
      }
      return
    }

    if (selectedSquare.value && highlightedSquares.value.has(id)) {
      const piece = game.pieces[selectedSquare.value]
      const isPawn = piece && (piece[1] === 'P' || piece[1] === 'p')
      const isPromotionSquare = 
        (id[1] === '8' && piece[0] === 'w') || 
        (id[1] === '1' && piece[0] === 'b')
      
      if (isPawn && isPromotionSquare) {
        // Ход с превращением
        game.promotionMove = {
          from: selectedSquare.value,
          to: id,
          piece: piece,
          pending: true
        }
        game.showPromotionModal = true
        
        selectedSquare.value = null
        highlightedSquares.value.clear()
      } else {
        // Обычный ход
        game.sendMove(selectedSquare.value, id)
        selectedSquare.value = null
        highlightedSquares.value.clear()
      }
    } else {
      // Клик мимо 
      selectedSquare.value = null
      highlightedSquares.value.clear()
    }
  }

  const handlePromotionSelect = (piece) => {
    game.completePromotion(piece)
    resetSelection()
  }

  // Обработчик отмены превращения
  const handlePromotionCancel = () => {
    game.cancelPromotion()
    resetSelection()
  }

  const resetSelection = () => {
    selectedSquare.value = null
    highlightedSquares.value.clear()
  }

  const isSquareSelected = (id) => selectedSquare.value === id

  const isSquareHighlighted = (id) => highlightedSquares.value.has(id)

  watch(() => game.result.type, () => {
    if (game.result.type) {
      resetSelection()
    }
  })

  watch(() => game.currentTurn, () => {
    if (selectedSquare.value) {
      const piece = game.pieces[selectedSquare.value]
      if (piece && piece[0] !== game.currentTurn) {
        resetSelection()
      }
    }
  })

  return {
    selectedSquare,
    highlightedSquares,
    
    handleSquareClick,
    handlePromotionSelect,
    handlePromotionCancel,
    resetSelection,
    
    isSquareSelected,
    isSquareHighlighted,
    
    hasSelection: computed(() => selectedSquare.value !== null),
    availableMovesCount: computed(() => highlightedSquares.value.size)
  }
}