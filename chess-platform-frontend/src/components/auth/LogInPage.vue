<template>
  <div class="login-page">
    <div class="login-form">
      <h2 class="title">Войти</h2>
      <form class="login-form__container" @submit.prevent="handleLogin">
        <input
          v-model="loginData.identifier"
          class="form-input"
          type="text"
          placeholder="Логин или электронная почта"
          required
        />
        <input
          v-model="loginData.password"
          class="form-input"
          type="password"
          placeholder="Пароль"
          required
        />

        <button class="submit-btn" type="submit" :disabled="isLoading">
          {{ isLoading ? "Вход..." : "Войти" }}
        </button>
      </form>

      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>

      <div class="form-footer">
        <a href="#" class="footer-link">Сброс пароля</a>
        <router-link to="signup" class="footer-link">Нет аккаунта?</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";

const userStore = useUserStore();
const router = useRouter();

const loginData = reactive({
  identifier: "", // Может быть email или username
  password: "",
});

const message = ref("");
const messageType = ref("");
const isLoading = ref(false);

const handleLogin = async () => {
  if (!loginData.identifier || !loginData.password) {
    showMessage("Заполните все поля", "error");
    return;
  }

  isLoading.value = true;
  showMessage("Выполняется вход...", "info");

  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: loginData.identifier,
        password: loginData.password,
      }),
    });

    const result = await response.json();

    if (result.success) {
      showMessage("Вход выполнен успешно!", "success");

      userStore.login(result.user, result.token);

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } else {
      showMessage(`${result.error}`, "error");
    }
  } catch (error) {
    console.error("Ошибка входа:", error);
    showMessage("Ошибка подключения к серверу", "error");
  } finally {
    isLoading.value = false;
  }
};

const showMessage = (text, type) => {
  message.value = text;
  messageType.value = type;

  if (type !== "info") {
    setTimeout(() => {
      message.value = "";
      messageType.value = "";
    }, 5000);
  }
};
</script>

<style scoped lang="less">
.login-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 100px);
  padding: 40px 20px;
  background: #2c2c2c;
}

.login-form {
  width: 100%;
  max-width: 420px;
  padding: 40px 30px;
  border-radius: 12px;
  background-color: #353535;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.login-form__container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title {
  margin: 0;
  margin-bottom: 30px;
  font-size: 38px;
  font-weight: 500;
  color: #fff;
  letter-spacing: 1.5px;
  font-family: "Arial", sans-serif;
}

.form-input {
  padding: 14px 16px;
  border: 2px solid #777;
  border-radius: 8px;
  font-size: 16px;
  background: #343434;
  color: #fff;
  transition: all 0.3s ease;

  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0px 1000px #343434 inset !important;
    -webkit-text-fill-color: #fff !important;
  }

  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0px 1000px #282828 inset !important;
  }

  &:autofill {
    background-color: #343434 !important;
    color: #fff !important;
  }
}

.form-input::placeholder {
  color: #aaa;
}

.form-input:focus {
  outline: none;
  border-color: #e74c3c;
  background: #282828;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
}

.submit-btn {
  padding: 14px;
  background: #e74c3c;
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
}

.submit-btn:hover:not(:disabled) {
  background: #c0392b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.submit-btn:disabled {
  background: #666;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.message {
  padding: 12px;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
  margin: 15px 0;
}

.message.success {
  background: rgba(46, 204, 113, 0.2);
  border: 1px solid #2ecc71;
  color: #2ecc71;
}

.message.error {
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid #e74c3c;
  color: #e74c3c;
}

.message.info {
  background: rgba(52, 152, 219, 0.2);
  border: 1px solid #3498db;
  color: #3498db;
}

.form-footer {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #444;
}

.footer-link {
  color: #3498db;
  text-decoration: none;
  font-size: 18px;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.footer-link:hover {
  color: #2980b9;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-page {
    padding: 20px 15px;
  }

  .login-form {
    padding: 30px 20px;
  }

  .title {
    font-size: 22px;
  }
}
</style>
