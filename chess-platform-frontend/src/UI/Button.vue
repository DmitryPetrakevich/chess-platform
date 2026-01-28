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
    <!-- Индикатор загрузки -->
    <span v-if="loading" class="btn-loader"></span>
    
    <!-- Иконка слева -->
    <span v-if="$slots.icon && !loading" class="btn-icon">
      <slot name="icon" />
    </span>
    
    <!-- Текст кнопки -->
    <span class="btn-text">
      <slot />
    </span>
    
    <!-- Иконка справа -->
    <span v-if="$slots.iconAfter && !loading" class="btn-icon">
      <slot name="iconAfter" />
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
}>()

defineEmits(['click'])
</script>

<style scoped>
.btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  padding: 12px 24px;
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
  background-color: rgb(91, 91, 195);
  color: white;
}

.btn-primary:hover:not(.btn-disabled):not(:disabled) {
  background-color: rgb(40, 40, 145);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(91, 91, 195, 0.3);
}

.btn-secondary {
  background-color: #555;
  color: white;
}

.btn-secondary:hover:not(.btn-disabled):not(:disabled) {
  background-color: #666;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-outline {
  background-color: transparent;
  color: rgb(91, 91, 195);
  border: 2px solid rgb(91, 91, 195);
}

.btn-outline:hover:not(.btn-disabled):not(:disabled) {
  background-color: rgba(91, 91, 195, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(91, 91, 195, 0.2);
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
  transform: translateY(1px);
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