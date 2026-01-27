<template>
  <div class="checkbox-wrapper">
    <input
      :id="id"
      :checked="modelValue"
      type="checkbox"
      class="checkbox"
      :required="required"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <label :for="id" class="checkbox-label">
      <slot />
    </label>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  id: string
  required?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>

<style scoped lang="less">
.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 10px 0;
}

.checkbox {
  height: 15px;
  width: 15px;
  margin-top: 2px;
  transform: scale(1.2);
  accent-color: #e74c3c;
}

.checkbox-label {
  color: #fff;
  font-size: 18px;
  line-height: 1.4;
  cursor: pointer;
}
</style>