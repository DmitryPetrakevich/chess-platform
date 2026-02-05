<template>
  <div 
    class="time-progress"
    :class="[size, variant, { 'low-time': isLowTime, 'critical-time': isCriticalTime }]"
    :title="title"
    @click="$emit('click', $event)"
  >
    <div class="progress-track">
      <div 
        class="progress-fill" 
        :style="fillStyle"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  time: {
    type: [Number, String],
    required: true,
    default: 0
  },
  maxTime: {
    type: [Number, String],
    default: 30
  },
  
  size: {
    type: String,
    default: 'medium', // 'small' | 'medium' | 'large' | 'xl'
    validator: (value) => ['small', 'medium', 'large', 'xl'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary', // 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  },
  
  lowThreshold: {
    type: Number,
    default: 0.3 // 30%
  },
  criticalThreshold: {
    type: Number,
    default: 0.1 // 10%
  },
  
  animate: {
    type: Boolean,
    default: true
  },
  animationDuration: {
    type: Number,
    default: 200 // мс
  },
  
  rounded: {
    type: Boolean,
    default: true
  },
  
  direction: {
    type: String,
    default: 'ltr', // 'ltr' (слева направо) | 'rtl' (справа налево)
    validator: (value) => ['ltr', 'rtl'].includes(value)
  }
});

const emit = defineEmits(['click']);

const currentTime = computed(() => {
  const time = Number(props.time);
  return isNaN(time) ? 0 : Math.max(time, 0);
});

const maxTimeValue = computed(() => {
  const max = Number(props.maxTime);
  return isNaN(max) || max <= 0 ? 30 : max;
});

const progress = computed(() => {
  if (maxTimeValue.value <= 0) return 0;
  return Math.min(currentTime.value / maxTimeValue.value, 1);
});

const isLowTime = computed(() => progress.value <= props.lowThreshold && progress.value > props.criticalThreshold);
const isCriticalTime = computed(() => progress.value <= props.criticalThreshold);

const fillStyle = computed(() => {
  const width = `${progress.value * 100}%`;
  
  const style = {
    width: width,
    transition: props.animate ? `width ${props.animationDuration}ms ease-out` : 'none'
  };
  
  if (props.direction === 'rtl') {
    style.marginLeft = 'auto';
  }
  
  return style;
});

const title = computed(() => {
  return `${Math.round(currentTime.value)} из ${maxTimeValue.value} секунд`;
});
</script>

<style lang="less" scoped>
.time-progress {
  width: 100%;
  cursor: default;
  
  &.small {
    .progress-track {
      height: 4px;
    }
  }
  
  &.medium {
    .progress-track {
      height: 6px;
    }
  }
  
  &.large {
    .progress-track {
      height: 8px;
    }
  }
  
  &.xl {
    .progress-track {
      height: 12px;
    }
  }
  
  // Варианты цветов
  &.primary {
    --progress-color: #2a92a4;
    --low-color: #f39c12;
    --critical-color: #e74c3c;
    --bg-color: rgba(52, 152, 219, 0.1);
  }
  
  &.secondary {
    --progress-color: #95a5a6;
    --low-color: #f39c12;
    --critical-color: #e74c3c;
    --bg-color: rgba(149, 165, 166, 0.1);
  }
  
  &.success {
    --progress-color: #2ecc71;
    --low-color: #f39c12;
    --critical-color: #e74c3c;
    --bg-color: rgba(46, 204, 113, 0.1);
  }
  
  &.warning {
    --progress-color: #f39c12;
    --low-color: #f39c12;
    --critical-color: #e74c3c;
    --bg-color: rgba(243, 156, 18, 0.1);
  }
  
  &.danger {
    --progress-color: #e74c3c;
    --low-color: #f39c12;
    --critical-color: #e74c3c;
    --bg-color: rgba(231, 76, 60, 0.1);
  }
  
  &.info {
    --progress-color: #17a2b8;
    --low-color: #f39c12;
    --critical-color: #e74c3c;
    --bg-color: rgba(23, 162, 184, 0.1);
  }
  
  // Автоматические цвета при малом времени
  &.low-time {
    --progress-color: var(--low-color);
  }
  
  &.critical-time {
    --progress-color: var(--critical-color);
    
    .progress-fill {
      animation: pulse 1s infinite;
    }
  }
}

.progress-track {
  width: 100%;
  background: var(--bg-color);
  border-radius: v-bind('props.rounded ? "100px" : "0"');
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.progress-fill {
  height: 100%;
  background: var(--progress-color);
  border-radius: v-bind('props.rounded ? "100px" : "0"');
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.15);
  
  background-image: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>