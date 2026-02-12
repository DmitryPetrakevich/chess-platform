<template>
  <button 
    class="btn"
    :class="{ 
      'btn-primary': variant === 'primary',
      'btn-secondary': variant === 'secondary',
      'btn-outline': variant === 'outline',
      'btn-disabled': disabled,
      'btn-sm': size === 'sm',
      'btn-lg': size === 'lg',
      'btn-full': fullWidth
    }"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="btn-loader"></span>
    
    <span v-if="icon && !loading" class="btn-icon">
      <img :src="icon" alt="" />
    </span>
    
    <span class="btn-text">
      <slot />
    </span>
    
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  icon?: string
}>()

defineEmits(['click'])
</script>

<style lang="less" scoped>
.btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  min-width: 120px;
  padding: 16px 30px;
  border: none;
  border-radius: 8px;
  font-family: "Manrope", sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  appearance: none;
  -webkit-appearance: none;
  user-select: none;
}

.btn-primary {
  background-color: @gray-500;
  color: white;
}

.btn-primary:hover:not(.btn-disabled):not(:disabled) {
  background-color: @gray-700;
}

.btn-secondary {
  background-color: #555;
  color: white;
}

.btn-secondary:hover:not(.btn-disabled):not(:disabled) {
  background-color: #666;
}

.btn-outline {
  background-color: transparent;
  color: rgb(91, 91, 195);
  border: 2px solid rgb(91, 91, 195);
}

.btn-outline:hover:not(.btn-disabled):not(:disabled) {
  background-color: rgba(91, 91, 195, 0.1);
}

.btn-sm {
  min-width: 100px;
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 6px;
}

.btn-lg {
  min-width: 160px;
  padding: 16px 32px;
  font-size: 18px;
  border-radius: 10px;
}

.btn-full {
  width: 100%;
  min-width: auto;
}

.btn-disabled,
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-disabled:hover,
.btn:disabled:hover {
  transform: none !important;
  box-shadow: none !important;
}

.btn:active:not(.btn-disabled):not(:disabled) {
  transition: transform 0.1s ease;
}

.btn:focus {
  outline: 3px solid rgba(91, 91, 195, 0.3);
  outline-offset: 2px;
}

.btn-loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

.btn-outline .btn-loader {
  border: 2px solid rgba(91, 91, 195, 0.3);
  border-top-color: rgb(91, 91, 195);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-icon svg,
.btn-icon i {
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease;
}

.btn:hover:not(.btn-disabled):not(:disabled) .btn-icon svg,
.btn:hover:not(.btn-disabled):not(:disabled) .btn-icon i {
  transform: scale(1.1);
}

.btn-text {
  white-space: nowrap;
}

.btn-icon img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.btn-primary .btn-icon img,
.btn-secondary .btn-icon img {
  filter: invert(1);
}

@media (max-width: 1024px) {
  .btn {
    min-width: 110px;
    padding: 11px 22px;
  }
  
  .btn-lg {
    min-width: 150px;
    padding: 15px 30px;
  }
}

@media (max-width: 768px) {
  .btn {
    min-width: 100px;
    padding: 10px 20px;
    font-size: 15px;
  }
  
  .btn-sm {
    min-width: 90px;
    padding: 7px 14px;
    font-size: 13px;
  }
  
  .btn-lg {
    min-width: 140px;
    padding: 14px 28px;
    font-size: 17px;
  }
}

@media (max-width: 480px) {
  .btn {
    min-width: auto;
    width: 100%;
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .btn-sm {
    padding: 10px 14px;
    font-size: 13px;
  }
  
  .btn-lg {
    padding: 14px 20px;
    font-size: 16px;
  }
  
  .btn-text {
    white-space: normal; 
    text-align: center;
  }
  
  @media (max-width: 360px) {
    .btn {
      padding: 10px 14px;
      font-size: 13px;
    }
    
    .btn-sm {
      padding: 8px 12px;
      font-size: 12px;
    }
    
    .btn-lg {
      padding: 12px 18px;
      font-size: 15px;
    }
  }
}
</style>