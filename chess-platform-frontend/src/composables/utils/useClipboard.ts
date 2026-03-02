import { ref } from 'vue'

export function useClipboard() {
  const copied = ref(false)
  const error = ref(null)

  /**
   * Копирует текст в буфер обмена
   * @param {string} text - Текст для копирования
   * @returns {Promise<boolean>} - Успешно ли скопировано
   */
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      error.value = null
      
      setTimeout(() => {
        copied.value = false
      }, 1000)
      
      return true
    } catch (err) {
      console.error('Failed to copy:', err)
      error.value = 'Не удалось скопировать'
      return false
    }
  }

  return {
    copied,          
    error,           
    copyToClipboard  
  }
}