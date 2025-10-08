<template>
  <div class="app">
    <PageHeader />
    <RouterView></RouterView>
    <!-- <Play /> -->
    <!-- <RegistrationForm /> -->
    <!-- <LogInPage /> -->
      <!-- <MainPage /> -->
  </div>
</template>

<script setup>
import PageHeader from '@/components/PageHeader.vue';
import Play from '@/pages/PlayPage.vue';
import RegistrationForm from './components/RegistrationForm.vue';
import LogInPage from './components/LogInPage.vue';
import MainPage from './pages/MainPage.vue';
</script>

<style scoped>

</style>

