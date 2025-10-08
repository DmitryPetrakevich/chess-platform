<template>
    <header class="page-header">
        <div class="page-header__container">
            <router-link 
                to="/" 
                class="page-header__logo"
            >
                <span class="page-header__logo-img">
                    <img :src="logoIcon" alt="Настройки" class="profile-menu-icon">  
                    TUSUR Chess
                </span>
            </router-link>

            <nav class="page-header__nav">
                <router-link
                    to="coordinates"
                    class="page-header__nav-link"
                >
                    Координаты
                </router-link>

                <router-link
                    to="puzzles"
                    class="page-header__nav-link"
                >
                    Задачи
                </router-link>
                
                <a class="page-header__nav-link">Новости</a>
            </nav>
            
            <!-- Кнопки для НЕавторизованных -->
            <nav v-if="!userStore.isLoggedIn" class="page-header__btns">
                <router-link
                    to="/login"
                    class="page-header__btn page-header__btn--primary"
                >
                    Войти
                </router-link> 

                <router-link 
                    to="/signup"
                    class="page-header__btn page-header__btn--accent"
                >
                    Регистрация
                </router-link>
            </nav>
            
            <!-- Меню для АВТОРИЗОВАННЫХ -->
            <nav v-else class="page-header__user-menu">
                <div 
                    class="page-header__user-name"
                    @click="toggleMenu"
                >
                <img :src="profileNameIcon" alt="Профиль" class="profile-icon">    
                {{ userStore.username }}
                </div>

                <div
                v-if="isMenuOpen"
                class="page-header__overlay"
                @click="closeMenu"
                ></div>

                <div 
                    v-if="isMenuOpen"
                    class="page-header__dropdown"
                >
                    <router-link 
                        to="/profile" 
                        class="page-header__dropdown-item"
                        @click="closeMenu"
                    >
                        <img :src="profileIcon" alt="Профиль" class="profile-menu-icon">   
                        Профиль
                    </router-link>

                    <router-link 
                        to="/profile" 
                        class="page-header__dropdown-item"
                        @click="closeMenu"
                    >
                        <img :src="messageIcon" alt="Входящие" class="profile-menu-icon">  
                        Входящие
                    </router-link>

                    <router-link 
                        to="/profile" 
                        class="page-header__dropdown-item"
                        @click="closeMenu"
                    >
                        <img :src="settingsIcon" alt="Настройки" class="profile-menu-icon">  
                        Настройки
                    </router-link>

                    <button 
                        @click="userStore.logout()" 
                        class="page-header__dropdown-item"
                    >
                        <img :src="logOutIcon" alt="Выйти" class="profile-menu-icon">   
                        Выйти
                    </button>

                    <hr class="divider"/>

                    <router-link 
                        to="/profile" 
                        class="page-header__dropdown-item"
                        @click="closeMenu"
                    >
                        <img :src="languageIcon" alt="Язык" class="profile-menu-icon">
                        Язык
                    </router-link>

                    <router-link 
                        to="/profile" 
                        class="page-header__dropdown-item"
                        @click="closeMenu"
                    >
                        <img :src="themeIcon" alt="Тема" class="profile-menu-icon"> 
                        Тема
                    </router-link>
                </div>
            </nav>
        </div>
    </header>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'

import logoIcon from '@/assets/icons/logo.svg'
import profileNameIcon from '@/assets/icons/profile-name.svg'
import profileIcon from '@/assets/icons/profile.svg'
import messageIcon from '@/assets/icons/message.svg'
import settingsIcon from '@/assets/icons/settings.svg'
import logOutIcon from '@/assets/icons/logout.svg'
import languageIcon from '@/assets/icons/language.svg'
import themeIcon from '@/assets/icons/theme.svg'

const route = useRoute()

/**
 * Хранилище состояния пользователя
 * 
 * Содержит информацию об авторизации, имени пользователя и методы работы с пользователем
 */
const userStore = useUserStore() 

/**
 * Реактивная переменная для отслеживания состояния видимости выпадающего меню
 * 
 * true - меню открыто, false - меню закрыто
 */
const isMenuOpen = ref(false)

/**
 * Функция для переключения состояния выпадающего меню
 * 
 * Меняет значение isMenuOpen на противоположное
 */
const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
}

/**
 * Функция для закрытия выпадающего меню
 * 
 * Устанавливает isMenuOpen в false
 */
const closeMenu = () => {
    isMenuOpen.value = false
}

watch(() => route.fullPath, closeMenu)

watch(() => userStore.isLoggedIn, closeMenu);
</script>

<style scoped lang="less">
.page-header {
    display: block;
    box-sizing: border-box;
    height: 60px;
    width: 100%;
    background: #1a1a1a;
    border-bottom: 1px solid #333;
    z-index: 1000;
}

.page-header__container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    padding: 0 60px;
    max-width: 1400px;
    margin: 0 auto;
}

.profile-icon {
    width: 30px;           
    height: 30px;
    filter: invert(1);     
}

.profile-menu-icon {
    width: 20px;           
    height: 20px;
    filter: invert(1);     
}

.page-header__user-menu {
    position: relative;
    display: flex;
    align-items: center;
    gap: 15px;
}

.page-header__user-name {
    display: flex;
    gap: 10px;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 20px;
    font-weight: 400;
    font-family: 'Manrope', sans-serif;
    border-radius: 5px;
    cursor: pointer;
    user-select: none;
    padding: 10px;
    transition: all ease 0.3s;
    z-index: 1000;

    &:hover {
        background: #3b3b3b;
    }
}

.page-header__overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.2);
    z-index: 998; 
}

.page-header__dropdown {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 70px;
    right: 10px;
    width: 200px; 
    border-radius: 5px;
    padding: 10px;
    min-height: 300px;
    background: #2b2b2b;
    border-left: 3px solid #444;
    border-top: 1px solid #444;
    z-index: 999; 
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
    transform: translateX(0); 
    animation: slideIn 0.2s ease-out; 
}

@keyframes slideIn {
    from {
        transform: translateX(100%); 
    }
    to {
        transform: translateX(0); 
    }
}

.page-header__dropdown-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    color: white;
    font-family: 'Manrope', sans-serif;
    text-decoration: none;
    padding: 10px 15px;
    text-align: left;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 20px;
    transition: all 0.3s ease;
}

.page-header__dropdown-item:hover {
    background: #3b3b3b;
}

.page-header__logo {
    display: block; 
    font-size: 20px;
    font-weight: 800;
    color: #fff;
    font-family: 'Manrope', sans-serif;
    text-transform: uppercase;
    letter-spacing: 3px;
    font-family: 'Arial', sans-serif;
    text-decoration: none; 
}

.page-header__nav {
    display: flex;
    gap: 40px;
}

.page-header__nav-link {
    color: white;
    text-decoration: none;
    font-size: 20px;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    padding: 8px 0;
    position: relative;
    transition: all 0.3s ease;
    cursor: pointer;
}

.page-header__nav-link:hover {
    color: #e74c3c;
}

// .page-header__nav-link::after {
//     content: '';
//     position: absolute;
//     bottom: 0;
//     left: 0;
//     width: 0;
//     height: 2px;
//     background: #e74c3c;
//     transition: width 0.3s ease;
// }

.page-header__nav-link:hover::after {
    width: 100%;
}

.page-header__btns {
    display: flex;
    gap: 20px;
}

.page-header__btn {
    display: inline-block; 
    padding: 8px 15px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-decoration: none; 
    text-align: center; 
    color: inherit; 
}

.page-header__btn--primary {
    background: #555;
    color: white;
    border: 2px solid #555;
}

.page-header__btn--primary:hover {
    background: #666;
    border-color: #666;
}

.page-header__btn--accent {
    background: #e74c3c;
    color: white;
    border: 2px solid #e74c3c;
}

.page-header__btn--accent:hover {
    background: #c0392b;
    border-color: #c0392b;
}

.page-header__btn:focus,
.page-header__btn:active {
    outline: none;
}

.page-header__btn.router-link-active {
    box-shadow: 0 0 0 2px rgba(255,255,255,0.3); 
}

@media (max-width: 768px) {
    .page-header__container {
        padding: 0 25px;
    }
    
    .page-header__logo {
        font-size: 20px;
    }
    
    .page-header__btn {
        padding: 10px 20px;
        font-size: 13px;
    }
    
    .page-header__nav {
        gap: 25px;
    }
    
    .page-header__nav-link {
        font-size: 14px;
    }
    
    .page-header__user-name {
        font-size: 14px;
    }
}

.divider {
  border: none;
  border-top: 1px solid #444;
  margin: 10px 0;
}
</style>