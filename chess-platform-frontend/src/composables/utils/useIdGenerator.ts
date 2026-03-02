import { ref } from "vue";

export function useIdGenerator() {
    /**
     * Генерируте случаный ID
     * @param {number} length - длина ID (по умолчанию 8)
     * @returns {string}
     */
    const generateId = (length = 8) => {
        return Math.random().toString(36).slice(2, 2 + length)
    }

    return {
        generateId
    }
}