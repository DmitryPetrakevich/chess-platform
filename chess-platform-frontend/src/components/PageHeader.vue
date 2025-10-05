<template>
    <header class="page-header">
        <div class="page-header__container">
            <router-link 
                to="/" 
                class="page-header__logo"
            >
                <span class="page-header__logo-img">
                    TUSUR Chess
                </span>
            </router-link>
            
            <nav class="page-header__btns">
                <router-link
                    to="/login"
                    class="page-header__btn page-header__btn--primary"
                >
                    Войти
                </router-link> 

                <router-link 
                    to="/signup"
                    class="page-header__btn page-header__btn--accent"
                >
                    Регистрация
                </router-link>
            </nav>
        </div>
    </header>
</template>

<script setup>

</script>

<style scoped>
.page-header {
    height: 60px;
    width: 100%;
    background: #1a1a1a;
    border-bottom: 1px solid #333;
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
    display: block; 
    font-size: 28px;
    font-weight: 800;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 3px;
    font-family: 'Arial', sans-serif;
    text-decoration: none; 
    
}

.page-header__btns {
    display: flex;
    gap: 20px;
}

.page-header__btn {
    display: inline-block; 
    padding: 8px 15px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-decoration: none; 
    text-align: center; 
    color: inherit; 
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

/* Убираем стандартные стили ссылок */
.page-header__btn:focus,
.page-header__btn:active {
    outline: none; /* Убираем outline по умолчанию */
}

.page-header__btn.router-link-active {
    box-shadow: 0 0 0 2px rgba(255,255,255,0.3); 
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