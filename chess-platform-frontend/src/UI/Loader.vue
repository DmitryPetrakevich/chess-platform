<template>
  <div class="loading-state" :class=[size]>
    <div class="material-spinner" :class=[size]></div>
    <div class="loading-text" :class=[size]> {{ text }}</div>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: 'Загрузка...'
  },
  size: {
    type: String,
    default: 'middle',
    validator: (value) => ['small', 'middle', 'large'].includes(value)
  }
})
</script>

<style scoped lang="less">
.loading-state { 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;

  &.small {
    gap: 12px;
  }
}

.material-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid @black-600;
  border-top-color: @green-600;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  &.small {
    width: 32px;
    height: 32px;
    border-width: 3px;
  }

  &.large {
    width: 64px;
    height: 64px;
    border-width: 5px;
  }
}

.loading-text {
  font-size: 16px;
  color: @text-light;

  &.small {
    font-size: 13px;
  }

  &.large {
    font-size: 18px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>