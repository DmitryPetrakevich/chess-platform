<template>
  <div class="promotion-modal-overlay" @click="cancel">
    <div class="promotion-modal" @click.stop>
      <div class="promotion-title">
        Выберите фигуру превращения
      </div>
      <div class="promotion-pieces">
        <button 
          v-for="piece in availablePieces" 
          :key="piece"
          class="promotion-piece"
          @click="select(piece)"
        >
          <img 
            :src="getPieceImage(piece)" 
            :alt="getPieceName(piece)"
            class="promotion-piece-image"
          />
          <div class="promotion-piece-name">{{ getPieceName(piece) }}</div>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  color: {
    type: String,
    required: true,
    validator: (value) => ['w', 'b'].includes(value)
  }
});

const emit = defineEmits(['select', 'cancel']);

const availablePieces = computed(() => ['q', 'r', 'b', 'n']);

function getPieceImage(piece) {
  const pieceCode = `${props.color}${piece.toUpperCase()}`;
  return new URL(`../../assets/chess-pieces/${pieceCode}.svg`, import.meta.url).href;
}

function getPieceName(piece) {
  const names = {
    'q': 'Ферзь',
    'r': 'Ладья',
    'b': 'Слон',
    'n': 'Конь'
  };
  return names[piece];
}

function select(piece) {
  emit('select', piece);
}

function cancel() {
  emit('cancel');
}
</script>

<style scoped>
.promotion-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.promotion-modal {
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  min-width: 200px;
  max-width: 400px;
}

.promotion-title {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  font-family: Arial, Helvetica, sans-serif;
  margin-bottom: 20px;
  color: #333;
}

.promotion-pieces {
  display: flex;
  flex-direction: row;
  gap: 16px;
  margin-bottom: 20px;
}

.promotion-piece {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.promotion-piece:hover {
  background: #e2e8f0;
  border-color: #94a3b8;
  transform: translateY(-2px);
}

.promotion-piece-image {
  width: 50px;
  height: 50px;
  margin-bottom: 8px;
}

.promotion-piece-name {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.promotion-cancel {
  width: 100%;
  padding: 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.promotion-cancel:hover {
  background: #dc2626;
}

@media (max-width: 768px) {
  .promotion-modal {
    min-width: 250px;
    padding: 16px;
  }
  
  .promotion-piece-image {
    width: 40px;
    height: 40px;
  }
  
  .promotion-piece {
    padding: 8px;
  }
}
</style>