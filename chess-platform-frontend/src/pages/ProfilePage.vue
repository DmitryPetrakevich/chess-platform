<template>
  <div class="profile-page">
    <div class="profile-container">
      <aside class="sidebar">
        <ProfileRatings />
        <!-- <ProfileActivity class="activity-section" /> -->
      </aside>

      <main class="main-content">
        <ProfileMain />
        <ProfileGames />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "@/store/userStore";
import ProfileRatings from "@/components/profile/ProfileRatings.vue";
import ProfileMain from "@/components/profile/ProfileMain.vue";
import ProfileActivity from "@/components/profile/ProfileActivity.vue";
import ProfileGames from "@/components/profile/ProfileGames.vue";

const userStore = useUserStore();
</script>

<style scoped lang="less">
.profile-page {
  padding: 30px;
  // min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.profile-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 10px;
  min-height: calc(100vh - 60px);
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-section {
  flex: 1;
  min-height: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

@media (max-width: 1100px) {
  .profile-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 15px;
  }
  
  .main-content {
    padding: 20px;
  }
}
</style>