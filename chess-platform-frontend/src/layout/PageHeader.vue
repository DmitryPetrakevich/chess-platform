<template>
  <header class="page-header">
    <div class="page-header__container">
      <div class="page-header__left">
        <div class="burger" @click="toggleMobileMenu">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <router-link to="/" class="page-header__logo">
          <div class="page-header__logo__container">
            <img :src="logoIcon" alt="Логотип" class="page-header__logo-img" />
            <span class="page-header__logo-text">
              TUSUR Chess
            </span>
          </div>
        </router-link>
      </div>

      <nav class="page-header__nav">
        <router-link to="coordinates" class="page-header__nav-link">
          Координаты
        </router-link>
        <router-link to="puzzles" class="page-header__nav-link">Задачи</router-link>
        <a class="page-header__nav-link">Новости</a>
      </nav>

      <nav v-if="!userStore.isLoggedIn" class="page-header__btns">
        <router-link to="/login" class="page-header__btn page-header__btn--primary">
          Войти
        </router-link>
        <router-link to="/signup" class="page-header__btn page-header__btn--accent">
          Регистрация
        </router-link>
      </nav>

      <nav v-else class="page-header__user-menu">
        <div>
          <img :src="searchIcon" alt="Поиск" class="search-icon" />
        </div>
        <div>
          <img :src="notificationIcon" alt="Оповещение" class="notification-icon" />
        </div>

        <div class="page-header__user-name" @click="toggleMenu">
          {{ userStore.username }}
          <img :src="profileNameIcon" alt="Профиль" class="profile-icon" />
        </div>

        <div v-if="isMenuOpen" class="page-header__overlay" @click="closeMenu"></div>

        <div v-if="isMenuOpen" class="page-header__dropdown">
          <router-link to="/profile" class="page-header__dropdown-item" @click="closeMenu">
            <img :src="profileIcon" alt="Профиль" class="profile-menu-icon" />
            Профиль
          </router-link>

          <router-link to="/profile" class="page-header__dropdown-item" @click="closeMenu">
            <img :src="messageIcon" alt="Входящие" class="profile-menu-icon" />
            Входящие
          </router-link>

          <router-link to="/profile" class="page-header__dropdown-item" @click="closeMenu">
            <img :src="settingsIcon" alt="Настройки" class="profile-menu-icon" />
            Настройки
          </router-link>

          <button @click="userStore.logout()" class="page-header__dropdown-item">
            <img :src="logOutIcon" alt="Выйти" class="profile-menu-icon" />
            Выйти
          </button>

          <hr class="divider" />

          <router-link to="/profile" class="page-header__dropdown-item" @click="closeMenu">
            <img :src="languageIcon" alt="Язык" class="profile-menu-icon" />
            Язык
          </router-link>

          <router-link to="/profile" class="page-header__dropdown-item" @click="closeMenu">
            <img :src="themeIcon" alt="Тема" class="profile-menu-icon" /> Тема
          </router-link>
        </div>
      </nav>
    </div>
  </header>

  <div v-if="isMobileMenuOpen" class="mobile-menu-overlay" @click="closeMobileMenu"></div>

  <div v-if="isMobileMenuOpen" class="mobile-menu">
    <nav class="mobile-menu__nav">
      <router-link to="coordinates" class="page-header__nav-link" @click="closeMobileMenu">Координаты
      </router-link>
      <router-link to="puzzles" class="page-header__nav-link" @click="closeMobileMenu">
        Задачи
      </router-link>
      <a class="page-header__nav-link" @click="closeMobileMenu">
        Новости
      </a>
    </nav>

    <div class="mobile-menu__user">
      <template v-if="!userStore.isLoggedIn">
        <router-link to="/login" class="page-header__btn--primary" @click="closeMobileMenu">
          Войти
        </router-link>
        <router-link to="/signup" class="page-header__btn--accent" @click="closeMobileMenu">
          Регистрация
        </router-link>
      </template>

      <template v-else>
        <router-link to="/profile" @click="closeMobileMenu">{{
          userStore.username
        }}</router-link>
        <button @click="userStore.logout()">Выйти</button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/store/userStore";

import logoIcon from "@/assets/icons/logo.svg";
import profileNameIcon from "@/assets/icons/profile-name.svg";
import searchIcon from "@/assets/icons/search.svg";
import notificationIcon from "@/assets/icons/notification.svg";
import profileIcon from "@/assets/icons/profile.svg";
import messageIcon from "@/assets/icons/message.svg";
import settingsIcon from "@/assets/icons/settings.svg";
import logOutIcon from "@/assets/icons/logout.svg";
import languageIcon from "@/assets/icons/language.svg";
import themeIcon from "@/assets/icons/theme.svg";

const route = useRoute();
const userStore = useUserStore();
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

watch(() => route.fullPath, closeMenu);

watch(() => userStore.isLoggedIn, closeMenu);
</script>

<style scoped lang="less">
.page-header {
  display: block;
  box-sizing: border-box;
  height: 60px;
  width: 100%;
  background: @gray-900;
  border-bottom: 1px solid @gray-200;
  z-index: 1000;
}

.page-header__container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header__left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.profile-icon,
.notification-icon,
.search-icon {
  width: 30px;
  height: 30px;
  filter: invert(1);
}

.profile-menu-icon {
  width: 20px;
  height: 20px;
  filter: invert(1);
}

.page-header__logo-img {
  width: 40px;
  height: 40px;
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
  font-family: "Manrope", sans-serif;
  border-radius: 5px;
  padding: 5px;
  cursor: pointer;
  user-select: none;
  transition: all ease 0.3s;

  &:hover {
    background: @gray-700;
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
  box-sizing: border-box;
  top: 60px;
  right: 10px;
  width: 200px;
  border-radius: 5px;
  padding: 5px 0;
  min-height: 250px;
  background: @gray-900;
  border-left: 3px solid @gray-200;
  border-top: 1px solid @gray-200;
  z-index: 999;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
  transform: translateX(0);
  animation: slideIn 0.2s ease-out;
}

.page-header__dropdown-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  color: white;
  font-family: "Manrope", sans-serif;
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
  background: @gray-700;
}

.page-header__logo {
  display: block;
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  font-family: "Manrope", sans-serif;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-family: "Arial", sans-serif;
  text-decoration: none;
}

.page-header__logo__container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.page-header__logo-text {
  display: inline;
}

.page-header__nav {
  display: flex;
  gap: 40px;
}

.page-header__nav-link {
  color: white;
  text-decoration: none;
  font-size: 20px;
  font-family: "Poppins", sans-serif;
  font-weight: 500;
  // padding: 8px 0;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.page-header__nav-link:hover {
  color: @secondary-dark;
}

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
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .page-header__container {
    padding: 0 25px;
  }

  .page-header__logo {
    font-size: 14px;
  }

  .page-header__btn {
    padding: 6px 15px;
    font-size: 10px;
  }

  .page-header__nav {
    gap: 25px;
  }

  .page-header__nav-link {
    font-size: 14px;
  }

  .page-header__user-menu {
    gap: 10px;
  }

  .profile-icon,
  .notification-icon,
  .search-icon {
    width: 25px;
    height: 25px;
  }

  .page-header__user-name {
    gap: 10px;
    font-size: 16px;
  }
}

.burger {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 999;

  span {
    display: block;
    height: 3px;
    width: 100%;
    background: white;
    border-radius: 2px;
    transition: all 0.3s ease;
  }
}

.mobile-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 998;
}

.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100%;
  background: #2b2b2b;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 30px 20px;
  box-shadow: 5px 0 15px rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: slideInLeft 0.3s ease-out;
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(0);
  }
}

.mobile-menu__nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 50px;
}

.mobile-menu__nav a {
  color: white;
  text-decoration: none;
  font-size: 18px;
  transition: color 0.2s;
}

.mobile-menu__nav a:hover {
  color: #e74c3c;
}

@media (max-width: 990px) {
  .page-header__user-menu {
    gap: 10px;
  }

  .profile-icon,
  .notification-icon,
  .search-icon {
    width: 25px;
    height: 25px;
  }

  .page-header__user-name {
    gap: 10px;
    font-size: 16px;
  }



  .burger {
    display: flex;
  }

  .page-header__nav {
    display: none;
  }

  .page-header__container {
    padding: 0 20px;
  }
}

@media (max-width: 576px) {
  .page-header__logo-img {
    width: 25px;
    height: 25px;
  }

  .profile-icon,
  .notification-icon,
  .search-icon {
    width: 25px;
    height: 25px;
  }

  .page-header__user-menu {
    gap: 10px;
  }

  .page-header__user-name {
    font-size: 14px;
  }

  .page-header__logo-text {
    display: none;
  }

  .page-header__dropdown-item {
    gap: 8px;
    padding: 8px 12px;
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .page-header__left {
    gap: 20px;
  }

  .page-header__user-menu {
    gap: 5px;
  }

  .page-header__btn {
    padding: 6px 15px;
    font-size: 8px;
  }

  .page-header__btns {
    gap: 10px;
  }
}

.divider {
  border: none;
  border-top: 1px solid #444;
  margin: 10px 0;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}
</style>
