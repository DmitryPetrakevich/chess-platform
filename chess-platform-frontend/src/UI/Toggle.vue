<template>
    <label class="toggle-wrapper">
        <input
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        class="toggle-input"
        @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
        >

        <span class="toggle-slider"></span>

        <span class="toggle-label" @click.stop.prevent> 
            <slot> </slot> 
        </span>
    </label>
</template>

<script lang="ts" setup>
defineProps<{
    modelValue: boolean
    disabled?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
}>()

</script>

<style lang="less" scoped>
.toggle-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: relative;
  width: 44px;
  height: 24px;
  background-color: @red-700; 
  border-radius: 24px;
  transition: background-color 0.3s ease;
}

.toggle-slider::before {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  left: 2px;
  top: 2px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.toggle-input:checked + .toggle-slider {
  background-color: @green-700; 
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.toggle-label {
  font-size: 16px;
  color: #c6c6c6;
}

.toggle-wrapper.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>