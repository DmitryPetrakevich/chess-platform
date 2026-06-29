<template>
    <div class="check-email-page">
        <div class="check-email-card">
            <h2 class="title">✔️ Проверьте свой почтовый яшик</h2>

            <div class="description">
                <p class="description-text" style="margin-bottom: 20px">Мы отправили письмо по адресу
                    {{ email }}. Нажмите на ссылку в нём для сброса пароля.</p>
                <p class="description-text" style="margin-bottom: 10px">Если вы не получили письмо в течение 5 минут:
                </p>

                <ul class="list">
                    <li class="list-item">Проверьте папку "Спам»"</li>
                    <li class="list-item">Проверьте, что {{ email }} - это ваш адрес электронной почты
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const email = computed(() => {
    return route.query.email || "Ваша почта"
})
</script>

<style scoped lang="less">
.check-email-page {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    box-sizing: border-box;
    min-height: calc(100vh - 60px);
    padding: 40px 20px;
    background: @black-900;
}

.check-email-card {
    width: 100%;
    max-width: 1000px;
    padding: 20px 30px;
    border-radius: 12px;
    box-sizing: border-box;
    background-color: @black-800;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.title {
    margin-bottom: 30px;
    font-size: 28px;
    font-weight: 400;
    color: @text-light;
    letter-spacing: 1.5px;
    font-family: @font-main;
}

.description-text {
    color: @text-secondary;
    font-family: @font-main;
    line-height: 1.6;
    font-size: 18px;
}

.list {
    &-item {
        color: @text-light;
        line-height: 1.6;
        font-size: 22px;
        font-weight: 800;
        font-family: @font-main;
    }
}

@media (max-width: 768px) {
    .check-email-page {
        padding: 20px 15px;
    }

    .check-email-card {
        padding: 20px 20px;
    }

    .title {
        font-size: 26px;
    }

    .description-text {
        font-size: 16px;
    }

    .list {
        &-item {
            line-height: 1.4;
            font-size: 20px;
        }
    }
}

@media (max-width: 480px) {
    .check-email-page {
        padding: 20px 15px;
    }

    .check-email-card {
        padding: 10px;
    }

    .title {
        font-size: 20px;
    }

    .description-text {
        font-size: 16px;
    }

    .list {
        &-item {
            line-height: 1.4;
            font-size: 16px;
        }
    }
}
</style>