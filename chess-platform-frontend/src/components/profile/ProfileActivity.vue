<template>
  <div class="activity-card">
    <div class="card-header">
      <h3 class="card-title">Активность</h3>
    </div>
  </div>
</template>

<script setup>

</script>

<style scoped lang="less">
.activity-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f2f5;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.activity-timeline {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}
</style>