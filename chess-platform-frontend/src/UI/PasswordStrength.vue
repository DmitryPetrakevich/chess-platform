<template>
    <div class="password-strength-indicator">
        <p class="label">Надежность пароля</p>
        <div class="strength-bar">
            <div class="strength-fill" :style="{
                width: strengthPercent + '%',
                backgroundColor: strengthColor
            }"></div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    password: {
        type: String,
        required: true,
        default: ''
    },
})

/**
 * Проверяет надежность пароля по 5 критериям
 * @param {string} pwd - проверяемый пароль
 * @returns {number} score - количество выполненных критериев (0-5)
 * 
 * Критерии проверки:
 * 1. Длина >= 8 символов
 * 2. Есть строчные буквы (a-z)
 * 3. Есть заглавные буквы (A-Z)
 * 4. Есть цифры (0-9)
 * 5. Есть специальные символы 
 */
const checkStrength = (pwd) => {
    let score = 0

    if (pwd && pwd.length <= 8) return 1
    if (pwd.length >= 10) score++
    if (pwd.length >= 12) score++
    if (pwd.length >= 14) {
        return 5;
    }
    if (/[a-z]/.test(pwd)) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~]/.test(pwd)) score++

    return score 
}

/**
 * Вычисляет текущий балл надежности пароля
 */
const score = computed(() => checkStrength(props.password))
/**
 * Вычисляет процент заполнения прогресс-бара
 */
const strengthPercent = computed(() => (score.value / 5) * 100)
/**
 * Определяет цвет индикатора в зависимости от баллов   
 */
const strengthColor = computed(() => {
    switch (score.value) {
        case 0:
            return '#dc2626' 
        case 1:
            return '#f87171' 
        case 2:
            return '#f97316' 
        case 3:
            return '#eab308' 
        case 4:
            return '#3b82f6' 
        case 5:
        case 6:
            return '#22c55e' 
        default:
            return '#e5e7eb' 
    }
})
</script>

<style scoped lang="less">
.password-strength-indicator {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 100%;
}

.strength-bar {
    width: 100%;
    height: 4px;
    background-color: #e8e8e8;
    border-radius: 2px;
    overflow: hidden;
    position: relative;
}

.strength-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease, background-color 0.3s ease;
}

.label {
    font-size: 14px;
    color: @text-main;
    font-family: @font-main;
}
</style>