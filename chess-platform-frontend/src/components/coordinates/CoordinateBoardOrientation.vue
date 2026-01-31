<template>
    <div class="orientation">
        <div class="container">
            <button 
            class="btn"
            :class="{active: coordinationStore.activeColor === 'black'}"
            @click="coordinationStore.activeColor = 'black'; coordinationStore.flipped = true"         
            >
                <img 
                :src="blackKingIcon"
                alt="черные"
                class="btn-img"
                >
            </button>

            <button 
            class="btn"
            :class="{active: coordinationStore.activeColor === 'random'}"
            @click="coordinationStore.activeColor = 'random'"
            >
                <img 
                :src="randomIcon"
                alt="рандом"
                class="btn-img"
                >
            </button>

            <button 
            class="btn"
            :class="{active: coordinationStore.activeColor === 'white'}"
            @click="coordinationStore.activeColor = 'white'; coordinationStore.flipped = false""
            >
                <img 
                :src="whiteKingIcon"
                alt="белые"
                class="btn-img"
                >
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";

import whiteKingIcon from "@/assets/game/inviteModel/choice-white.svg"
import blackKingIcon from "@/assets/game/inviteModel/choice-black.svg"
import randomIcon from "@/assets/game/inviteModel/choice-random.svg"
import { useCoordinatesStore } from "@/store/coordinatesStore";

const coordinationStore = useCoordinatesStore()

</script>

<style lang="less" scoped>
.container {
    display: flex;
    flex-direction: row;
    width: 100%;
}

.btn {
    display: inline-flex;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
    padding: 5px 10px;
    font-size: 24px;
    width: 100%;
    border: 1px solid gray;
    background-color: @gray-300;
    transition: all 0.3s ease;

    &.active {
        background-color: @blue-400;
    }
}

.btn-img {
    height: 25px;
    width: 25px;
}
</style>