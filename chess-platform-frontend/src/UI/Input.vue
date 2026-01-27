<template>
  <div class="input-wrapper">
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      class="ui-input"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
    />
    <span v-if="errorMessage" class="error-text">{{ errorMessage }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
  type?: "text" | "email" | "password" | "number";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errorMessage?: string;
}>();

defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "focus"): void;
  (e: "blur"): void;
}>();
</script>

<style scoped lang="less">
.input-wrapper {
  position: relative;
  width: 100%;
}

.ui-input {
  box-sizing: border-box;
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #777;
  border-radius: 8px;
  font-size: 16px;
  background: #343434;
  color: #fff;
  transition: all 0.3s ease;

  &::placeholder {
    color: #aaa;
  }

  &:focus {
    outline: none;
    border-color: #e74c3c;
    background: #282828;
    box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.error-text {
  position: absolute;
  bottom: -20px;
  left: 0;
  color: #e74c3c;
  font-size: 13px;
}
</style>
