<template>
    <div class="profile-bar">
        <div class="profile-bar__container">
            <div class="rating-item">
                <img :src="bulletIcon" class="rating-item-img"/>
                <div class="rating-item-info">
                    <span class="rating-type">Пуля:</span>
                    <span class="rating-value">{{ userStore.bulletRating }}</span>
                </div>
            </div>

             <div class="rating-item">
                <img :src="blitzIcon" class="rating-item-img"/>
                <div class="rating-item-info">
                    <span class="rating-type">Блиц:</span>
                    <span class="rating-value">{{ userStore.blitzRating }}</span>
                </div>
            </div>

             <div class="rating-item">
                <img :src="rapidIcon" class="rating-item-img"/>
                <div class="rating-item-info">
                    <span class="rating-type">Рапид:</span>
                    <span class="rating-value">{{ userStore.rapidRating }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useUserStore } from "@/store/userStore";

import bulletIcon from "@/assets/profile/bullet.svg"
import blitzIcon from "@/assets/profile/blitz.svg"
import rapidIcon from "@/assets/profile/rapid.svg"

const userStore = useUserStore();

</script>

<style scoped>
.profile-bar__container {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 250px;
    gap: 20px;
}

.rating-item {
    display: flex;
    align-items: center;
    flex-direction: row;
    padding: 10px;
    gap: 30px;
    box-sizing: border-box;
    border: 1px solid white;
    width: 100%;
}

.rating-item-img {
    width: 60px;
    height: 60px;
    filter: invert(1)
}

.rating-item-info {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

     
}

</style>