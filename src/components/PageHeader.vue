<template>
    <header class="page-header">
        <div class="page-header__container">
            <div class="page-header__logo">
                <span class="page-header__logo-text">ЛОГОТИП</span>
            </div>
            
            <nav class="page-header__btns">
                <button class="page-header__btn page-header__btn--primary">
                    Войти
                </button>

                <button class="page-header__btn page-header__btn--accent">
                    Регистрация
                </button>
            </nav>
        </div>
    </header>
</template>

<script setup>
// Логика компонента
</script>

<style scoped>
.page-header {
    height: 80px;
    width: 100%;
    background: #1a1a1a;
    border-bottom: 1px solid #333;
    margin-bottom: 40px;
}

.page-header__container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    padding: 0 60px;
    max-width: 1400px;
    margin: 0 auto;
}

.page-header__logo {
    font-size: 28px;
    font-weight: 800;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 3px;
    font-family: 'Arial', sans-serif;
}

.page-header__btns {
    display: flex;
    gap: 20px;
}

.page-header__btn {
    padding: 14px 28px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 15px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.page-header__btn--primary {
    background: #555;
    color: white;
    border: 2px solid #555;
}

.page-header__btn--primary:hover {
    background: #666;
    border-color: #666;
}

.page-header__btn--accent {
    background: #e74c3c;
    color: white;
    border: 2px solid #e74c3c;
}

.page-header__btn--accent:hover {
    background: #c0392b;
    border-color: #c0392b;
}

@media (max-width: 768px) {
    .page-header__container {
        padding: 0 25px;
    }
    
    .page-header__logo {
        font-size: 20px;
    }
    
    .page-header__btn {
        padding: 10px 20px;
        font-size: 13px;
    }
}
</style>