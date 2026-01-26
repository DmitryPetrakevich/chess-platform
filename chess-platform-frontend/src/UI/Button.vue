<!-- src/ui/Button.vue -->
<template>
  <button 
    class="btn"
    :class="{ 
      'btn-primary': variant === 'primary',
      'btn-secondary': variant === 'secondary',
      'btn-disabled': disabled
    }"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'outline'
  disabled?: boolean
}>()

defineEmits(['click'])
</script>

<style lang="less" scoped>
.btn {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 220px;
  padding: 16px 32px;
  border: none;
  border-radius: 8px;
  font-family: "Manrope", sans-serif;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: rgb(91, 91, 195);
  color: white;
}

.btn-primary:hover {
  background-color: rgb(40, 40, 145);
}

.btn-secondary {
  background-color: #555;
  color: white;
}

.btn-secondary:hover {
  background-color: #666;
}

.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>