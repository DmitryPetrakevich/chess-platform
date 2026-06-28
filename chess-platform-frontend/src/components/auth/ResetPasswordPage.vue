<template>
  <div class="reset-password-page">
    <div class="reset-password-card">
      <h2 class="reset-password-title">Сброс пароля</h2>

      <form
        class="reset-password-form"
        @submit.prevent="handleForgotPassword"
      >
        <Input
          v-model="email"
          type="email"
          placeholder="Электронная почта"
          required
        />

        <button
          class="reset-password-submit"
          type="submit"
          :disabled="isLoading"
        >
          {{ isLoading ? "Отправка..." : "Отправить ссылку" }}
        </button>
      </form>

      <div
        v-if="message"
        :class="['reset-password-message', messageType]"
      >
        {{ message }}
      </div>

      <div class="reset-password-footer">
        <router-link
          to="/login"
          class="reset-password-link"
        >
          ← Вернуться ко входу
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Input from "@/UI/Input.vue";

const router = useRouter();
const email = ref("");

const message = ref("");
const messageType = ref("");
const isLoading = ref(false);

const handleForgotPassword = async () => {
  if (!email.value) {
    showMessage("Введите адрес электронной почты", "error");
    return;
  }

  isLoading.value = true;

  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.push("/check-email")

  } catch (error) {
    console.error(error);

    showMessage(
      "Ошибка подключения к серверу.",
      "error"
    );
  } finally {
    isLoading.value = false;
  }
};

const showMessage = (text, type) => {
  message.value = text;
  messageType.value = type;

  setTimeout(() => {
    message.value = "";
    messageType.value = "";
  }, 5000);
};
</script>

<style scoped lang="less">
.reset-password-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
  min-height: calc(100vh - 60px);
  padding: 40px 20px;
  background: @black-900;
}

.reset-password-card {
  width: 100%;
  max-width: 450px;
  padding: 20px 30px;
  border-radius: 12px;
  box-sizing: border-box;
  background-color: @black-800;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.reset-password-title {
  margin-bottom: 30px;
  font-size: 38px;
  font-weight: 500;
  color: @text-main;
  letter-spacing: 1.5px;
  font-family: @font-main;
}

.reset-password-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.reset-password-submit {
  padding: 14px;
  background: @red-500;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 10px;

  &:hover:not(:disabled) {
    background: @red-600;
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
  }

  &:disabled {
    background: #666;
    cursor: not-allowed;
    box-shadow: none;
  }
}

.reset-password-message {
  padding: 12px;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
  margin: 15px 0;

  &.success {
    background: rgba(46, 204, 113, 0.2);
    border: 1px solid #2ecc71;
    color: #2ecc71;
  }

  &.error {
    background: rgba(231, 76, 60, 0.2);
    border: 1px solid #e74c3c;
    color: #e74c3c;
  }

  &.info {
    background: rgba(52, 152, 219, 0.2);
    border: 1px solid #3498db;
    color: #3498db;
  }
}

.reset-password-footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #444;
}

.reset-password-link {
  color: @blue-500;
  text-decoration: none;
  font-size: 18px;
  transition: all 0.3s ease;

  &:hover {
    color: #2980b9;
    text-decoration: underline;
  }
}

@media (max-width: 768px) {
  .reset-password-page {
    padding: 20px 15px;
  }

  .reset-password-card {
    padding: 30px 20px;
  }

  .reset-password-title {
    font-size: 28px;
  }
}
</style>