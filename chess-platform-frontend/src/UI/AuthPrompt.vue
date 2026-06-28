<template>
    <div class="auth-message">
        <p class="auth-title">Зарегистрируйтесь, чтобы играть</p>
        <p class="auth-desc">Создайте аккаунт или войдите, чтобы начать партию с другом</p>
        <div class="auth-buttons">
          <router-link to="/login" class="auth-btn login">
            Войти
          </router-link>
          <router-link to="/signup" class="auth-btn signup">
            Регистрация
          </router-link>
        </div>
      </div>
  
</template>

<script setup>

</script>

<style lang="less" scoped>
.auth-message {
  text-align: center;
  padding: 20px;
  color: @text-main;
  font-family: @font-main;
}

.auth-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
  color: @text-main;
  font-family: @font-main;
}

.auth-desc {
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.5;
  font-family: @font-main;
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-btn {
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s ease;
  color: @text-main;
  font-family: @font-main;
}

.login {
  background: #555;
  color: @text-main;
}

.login:hover {
  background: #666;
}

.signup {
  background: #e74c3c;
  color: white;
}

.signup:hover {
  background: #c0392b;
}

@media (max-width: 480px) {
  .auth-message {
    padding: 5px;
  }
  
  .auth-title {
    font-size: 18px;
  }
  
  .auth-desc {
    font-size: 13px;
  }
  
  .auth-btn {
    padding: 10px 16px;
    font-size: 14px;
  }
}
</style>