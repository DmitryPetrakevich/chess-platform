<template>
    <select 
    class="my-select"
    :value="modelValue"
    @change="handleChange"
    >
        <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        class="option"
        >
            {{ option.label }}
        </option>
    </select>
</template>

<script setup lang="ts">
interface Option {
    value: string | number,
    label: string
}

defineProps<{
    options: Option[],
    modelValue?: string | number
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number): void;
    (e: 'change', value: string | number): void;
}>()

const handleChange = (e) => {
    const target = event.target as HTMLSelectElement;
    emit('update:modelValue', target.value)
    emit("change", target.value)
}
</script>

<style scoped lang="less">
.my-select {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid #777;
    border-radius: 8px;
    font-size: 16px;
    background: @black-700;
    color: #fff;
    transition: all 0.3s ease;

    &:hover {
        border-color: @red-500;
    }
}
</style>