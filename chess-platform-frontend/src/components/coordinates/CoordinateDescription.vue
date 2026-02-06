<template>
    <div class="description">
        <h2>Координаты</h2>
        <p class="text">
            Знание координат на шахматной доске — очень важный навык для шахматиста:
        </p>

        <ul>
            <li class="text">В большинстве шахматных курсов и упражнений широко используется шахматная нотация.</li>
            <li class="text">Вам будет проще общаться с другом-шахматистом, если вы оба будете понимать «язык шахмат». </li>
            <li class="text">Анализировать игры гораздо проще, когда не тратится время на поиск полей по их координатам.</li>
        </ul>

        <p style="margin-bottom: 10px;" class="text">
            Координаты появляются на доске, и вам нужно 
            отметить соответствующее им поле.
        </p>

        <p v-if="coordinatesStore.activeMode === 'timer'" class="text">
            У вас есть <span style="color: red">30 секунд</span> на то, чтобы правильно 
            отметить как можно больше полей!
        </p>

        <p v-if="coordinatesStore.activeMode === 'infinite'" class="text">
            Продвиньтесь так далеко, как сможете.<span style="color: red;"> Время не 
            ограничено!</span> 
        </p>
    </div>
</template>

<script setup>
import { useCoordinatesStore } from '@/store/coordinatesStore';

const coordinatesStore = useCoordinatesStore()

</script>

<style lang="less" scoped>
.description {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
    padding: 10px;
    border-radius: 10px;
    background-color: #2a2a2a;
}

.text {
    font-size: 16px;
    color: rgb(222, 222, 222);
    line-height: 1.5; 
    font-family: 'Manrope', sans-serif;
}

p {
    white-space: pre-wrap;
}

h2 {
    font-size: 36px;
    margin-bottom: 20px;
    color: rgb(222, 222, 222);
    font-family: 'Manrope', sans-serif;
}

li {
    margin-bottom: 10px;
}

@media (max-width: 480px) {
.text {
    font-size: 13px;
}

h2 {
    font-size: 30px;
}

}
</style>