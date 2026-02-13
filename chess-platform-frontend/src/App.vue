<template>
  <div class="app">
    <PageHeader />
    <RouterView></RouterView>
  </div>
</template>

<script setup>
import PageHeader from '@/layout/PageHeader.vue';
import Play from '@/pages/PlayPage.vue';
import RegistrationForm from './components/auth/RegistrationForm.vue';
import LogInPage from './components/auth/LogInPage.vue';
import MainPage from './pages/MainPage.vue';
</script>

<style scoped>
.app {
  background-color: #1c1c1c;;
}  

.no-scroll {
  overflow: hidden !important;
  position: fixed;
  width: 100%;
  height: 100%;
}
</style>

