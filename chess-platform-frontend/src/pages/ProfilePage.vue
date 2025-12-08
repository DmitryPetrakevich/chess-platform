<template>
  <div class="profile">
    <div class="profile-container">

      <ProfileRatings />

      <main class="main-content">
        <h1 class="title">Профиль игрока {{ userStore.username }}</h1>

      
      </main>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "@/store/userStore";
import ProfileRatings from "@/components/profile/ProfileRatings.vue";

const userStore = useUserStore();
</script>

<style scoped>
.profile {
  padding: 0 60px;

}

.profile-container {
  background: #1c1c1c; 
  width: 100%;
  min-height: 100vh;
  display: flex;
  color: #fff;
}

.sidebar {
  width: 250px;
  padding: 20px;
  background: #3a3a3a;
  border-right: 1px solid #555;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #e74c3c;
}

.ratings-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rating-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 8px;
  background: #4a4a4a;
  border-radius: 4px;
}

.rating-type {
  font-weight: 500;
}

.rating-value {
  font-weight: 700;
  color: #e74c3c;
}

.main-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  /* align-items: center;
  justify-content: center; */
}

.title {
  color: #e74c3c;
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 20px 0;
  text-align: center;
}
</style>