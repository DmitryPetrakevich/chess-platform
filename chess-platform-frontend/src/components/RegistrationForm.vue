<template>
    <div class="registration-page">
        <div class="registration-form">
            <form class="registration-form__container" @submit.prevent="handleRegistration">
                
                <h2 class="title">Регистрация</h2>
            
                <input 
                    v-model="formData.username" 
                    class="form-input" 
                    type="text" 
                    placeholder="Имя пользователя" 
                    required 
                />
                <input 
                    v-model="formData.email" 
                    class="form-input" 
                    type="email" 
                    placeholder="Email" 
                    required 
                />
                <input 
                    v-model="formData.password" 
                    class="form-input" 
                    type="password" 
                    placeholder="Пароль" 
                    required 
                />

                <div class="checkbox-container">
                    <input 
                        v-model="formData.agreement" 
                        type="checkbox" 
                        id="agreement" 
                        class="checkbox"
                    />
                    <label for="agreement" class="checkbox-label">
                        Я соглашаюсь с <a href="#" class="link">политикой конфиденциальности</a>
                    </label>
                </div>

                <button class="submit-btn" type="submit">
                    Зарегистрироваться
                </button>

                <div v-if="message" :class="['message', messageType]">
                    {{ message }}
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'; 
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';

const router = useRouter(); 
const userStore = useUserStore(); 

const formData = reactive({
    username: '',
    email: '',
    password: '',
    agreement: false
});

const message = ref('');    
const messageType = ref(''); 
const isLoading = ref(false);

const handleRegistration = async () => { 
    if (!formData.agreement) {
        showMessage('Необходимо согласие с политикой конфиденциальности', 'error');
        return;
    }

    if (formData.password.length < 8) {
        showMessage('Пароль должен быть не менее 8 символов', 'error');
        return;
    }

    isLoading.value = true; 
    showMessage('Отправка данных...', 'info');

    try {
        const response = await fetch('http://localhost:3000/auth/register', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json', // Указываем что отправляем JSON
            },
            body: JSON.stringify({ 
                username: formData.username,
                email: formData.email,
                password: formData.password
            })
        });

        const result = await response.json();

        if (result.success) {
            showMessage('Регистрация успешна!', 'success');
            
            userStore.login(result.user, result.token);
            resetForm();
            
            setTimeout(() => {
                router.push('/');
            }, 1500);
        } else {
            showMessage(`${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Ошибка сети:', error);
        showMessage('Ошибка подключения к серверу', 'error');
    } finally {
        isLoading.value = false; 
    }
};

const showMessage = (text, type) => {
    message.value = text;
    messageType.value = type;
    
    if (type !== 'info') {
        setTimeout(() => {
            message.value = '';
            messageType.value = '';
        }, 5000);
    }
};

const resetForm = () => {
    formData.username = '';
    formData.email = '';
    formData.password = '';
    formData.agreement = false;
};
</script>

<style scoped lang="less">
.registration-page {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: calc(100vh - 100px);
    padding: 40px 20px;
    background: #2c2c2c; 
}

.registration-form {
    border-radius: 12px;
    padding: 40px 30px;
    background: #353535; 
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    width: 100%;
    max-width: 420px;
}

.registration-form__container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.title {
    margin: 0;
    margin-bottom: 20px;
    font-size: 38px;
    font-weight: 500;
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
    margin-top: 15px;
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

@media (max-width: 768px) {
    .registration-page {
        padding: 20px 15px;
    }
    
    .registration-form {
        padding: 30px 20px;
    }
    
    .title {
        font-size: 22px;
    }
}
</style>