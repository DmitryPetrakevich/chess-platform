import { defineStore } from "pinia";
import { ref, reactive } from "vue";

export const useCoordinatesStore = defineStore('coordinates', () => {

    const activeMode = ref('timer')
    const activeColor = ref('white')
    const flipped = ref(false)
    const showPieces = ref(true)
    const showCoordinates = ref(true)

    const pieces = reactive<Record<string, string>>({
        'a1': 'wR', 'b1': 'wN', 'c1': 'wB', 'd1': 'wQ', 'e1': 'wK', 'f1': 'wB', 'g1': 'wN', 'h1': 'wR',
        'a2': 'wP', 'b2': 'wP', 'c2': 'wP', 'd2': 'wP', 'e2': 'wP', 'f2': 'wP', 'g2': 'wP', 'h2': 'wP',
        
        'a7': 'bP', 'b7': 'bP', 'c7': 'bP', 'd7': 'bP', 'e7': 'bP', 'f7': 'bP', 'g7': 'bP', 'h7': 'bP',
        'a8': 'bR', 'b8': 'bN', 'c8': 'bB', 'd8': 'bQ', 'e8': 'bK', 'f8': 'bB', 'g8': 'bN', 'h8': 'bR'
    })

return {
    activeMode,
    activeColor,
    flipped,
    showPieces,
    showCoordinates,
    pieces
}
})