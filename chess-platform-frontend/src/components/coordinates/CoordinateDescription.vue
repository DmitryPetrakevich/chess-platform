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

        <p class="text">
            У вас есть 30 секунд на то, чтобы правильно 
            отметить как можно больше полей!
        </p>
    </div>
</template>

<script setup>

</script>

<style lang="less" scoped>
.description {
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
    padding: 10px;
    max-width: 350px;
    border: 1px solid rgb(174, 174, 174);
    background-color: #2a2a2a;
    max-height: 550px;
}

.text {
    font-size: 16px;
    color: white;
    line-height: 1.5; 
}

p {
    white-space: pre-wrap;
    // margin-bottom: 10px;
}

h2 {
    font-size: 36px;
    margin-bottom: 20px;
    color: white;
}

li {
    margin-bottom: 10px;
}
</style>