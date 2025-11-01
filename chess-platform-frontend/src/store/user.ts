import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
    /**
     * Флаг авторизации пользователя
     * @description Определяет, вошел ли пользователь в систему
     * - true: пользователь авторизован
     * - false: пользователь не авторизован
     * 
     * Используется для условного рендеринга в компонентах
     */
    const isLoggedIn = ref(false)
    /**
     * Данные пользователя из базы данных
     * @description Содержит полную информацию о пользователе:
     * - id: уникальный идентификатор
     * - username: имя пользователя
     * - email: электронная почта
     * - rating: рейтинг в шахматах
     * - created_at: дата регистрации
     */
    const userData = ref(null)
    /**
     * Токен авторизации для API запросов
     * @description Временный токен формата "temp-token-{userId}"
     * 
     * В будущем будет заменен на JWT токен
     * 
     * Используется для аутентифицированных запросов к серверу
     */
    const token = ref(null)
    /**
     * Имя пользователя (безопасное получение)
     * @description Возвращает username из userData или пустую строку если данных нет
     * 
     * Защита от ошибок: не ломает приложение если пользователь не авторизован
     */
    const username = computed(() => userData.value?.username || '')
    /**
     * ID пользователя
     * @description Возвращает id пользователя или null если не авторизован
     * 
     * Используется для API запросов где нужен идентификатор пользователя
     */
    const userId = computed(() => userData.value?.id || null)
    /**
     * Рейтинг пользователя в пулю
     * @description Возвращает рейтинг пользователя в пулю или 1200 по умолчанию
     */
    const bulletRating = computed(() => userData.value?.bullet_rating || 1200)
    /**
     * Рейтинг пользователя в блиц
     * @description Возвращает рейтинг пользователя в блиц или 1200 по умолчанию
     */
    const blitzRating = computed(() => userData.value?.blitz_rating || 1200)  
    /**
     * Рейтинг пользователя в рапид
     * @description Возвращает рейтинг пользователя в рапид или 1200 по умолчанию
     */
    const rapidRating = computed(() => userData.value?.rapid_rating || 1200)

    /**
     * Авторизация пользователя в системе
     * @param {object} userDataFromServer - Данные пользователя с сервера
     * @param {string} authToken - Токен авторизации
     * @description Выполняет полный процесс входа:
     * 1. Обновляет реактивное состояние стора
     * 2. Сохраняет данные в localStorage для persistence
     * 3. Делает пользователя "авторизованным" в приложении
     * @example 
     * userStore.login({id: 1, username: "john"}, "temp-token-1")
     */
    const login = (userDataFromServer, authToken) => {
        isLoggedIn.value = true
        userData.value = userDataFromServer
        token.value = authToken
        
        localStorage.setItem('authToken', authToken)
        localStorage.setItem('user', JSON.stringify(userDataFromServer))
    }

    /**
     * Выход пользователя из системы
     * @description Выполняет полный процесс выхода:
     * 1. Сбрасывает реактивное состояние стора
     * 2. Очищает localStorage
     * 3. Возвращает приложение в состояние "неавторизован"
     */
    const logout = () => {
        isLoggedIn.value = false
        userData.value = null
        token.value = null
        
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
    }

    /**
     * Проверка авторизации при загрузке приложения
     * @returns {boolean} - true если пользователь авторизован, false если нет
     * @description Автоматически проверяет наличие сохраненной сессии:
     * 1. Ищет токен и данные в localStorage
     * 2. Если находит - восстанавливает состояние авторизации
     * 3. Вызывается автоматически при создании стора
     */
    const checkAuth = () => {
        const storedToken = localStorage.getItem('authToken')
        const storedUser = localStorage.getItem('user')
        
        if (storedToken && storedUser) {
            isLoggedIn.value = true
            userData.value = JSON.parse(storedUser)
            token.value = storedToken
            return true
        }
        return false
    }

     /**
     * Обновление данных пользователя
     * @param {object} newData - Новые данные для обьединения с существующими
     * @description Частично обновляет данные пользователя:
     * 1. Объединяет старые и новые данные (spread оператор)
     * 2. Сохраняет обновленные данные в localStorage
     * 3. Используется при изменении профиля, рейтинга и т.д.
     * @example
     * userStore.updateUserData({rating: 1500}) // Обновляет только рейтинг
     */
    const updateUserData = (newData) => {
        if (userData.value) {
            userData.value = { ...userData.value, ...newData }
            localStorage.setItem('user', JSON.stringify(userData.value))
        }
    }

     /**
     * Автоматическая проверка авторизации при создании стора
     * @description Обеспечивает persistence между перезагрузками страницы
     * Вызывается сразу при импорте стора в любом компоненте
     */
    checkAuth()

    return {
        // Состояние
        isLoggedIn,
        userData,
        token,
        
        // Геттеры
        username,
        userId, 
        bulletRating,
        blitzRating,
        rapidRating,
        
        // Действия
        login,
        logout,
        checkAuth,
        updateUserData
    }
})