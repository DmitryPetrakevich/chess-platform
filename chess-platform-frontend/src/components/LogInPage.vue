<template>
    <div class="login-page">
        <div class="login-form">
            <h2 class="title">Войти</h2>
            <form class="login-form__container">
                <input class="form-input" type="text" placeholder="Логин или электронная почта" />
                <input class="form-input" type="password" placeholder="Пароль" />

                <button class="submit-btn" type="submit">Войти</button>
            </form>
        </div>
    </div>
</template>

<script setup>
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
    border: 1px solid #666;
    background-color: #353535; 
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);

}

.login-form__container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.title {
    margin: 0%;
    margin-bottom: 30px;
    font-size: 38px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 1.5px;
    font-family: 'Arial', sans-serif;
}

.form-input {
    padding: 14px 16px;
    border: 2px solid #777;
    border-radius: 8px;
    font-size: 16px;
    background: #343434;
    color: #fff;
    transition: all 0.3s ease;

      /* Хак для Chrome/Safari */
  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0px 1000px #343434 inset !important;
    -webkit-text-fill-color: #fff !important;
  }
  
  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0px 1000px #282828 inset !important;
  }
  
  /* Для Firefox */
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

.checkbox-container {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin: 10px 0;
}

.checkbox {
    height: 15px;
    width: 15px;
    margin-top: 2px;
    transform: scale(1.2);
    accent-color: #e74c3c; 
}

.checkbox-label {
    color: #fff;
    font-size: 18px;
    line-height: 1.4;
    cursor: pointer;
}

.link {
    color: #e74c3c;
    text-decoration: none;
}

.link:hover {
    text-decoration: underline;
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

.submit-btn:hover {
    background: #c0392b;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
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

/* Убираем скролл */
// :global(html),
// :global(body) {
//     overflow: hidden;
//     height: 100%;
// }
</style>