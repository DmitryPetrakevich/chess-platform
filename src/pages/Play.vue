<template>
    <div class="play">
        <div class="board_chess">
`        <ChessBoard />
        <ChessClock />`
        </div>
    </div>
</template>

<script setup>
import ChessBoard from '@/components/ChessBoard.vue';
import ChessClock from '@/components/ChessClock.vue';

</script>

<style scoped>
.board_chess {
    display: flex;
    flex-direction: row;
    margin: 0 100px;
}


</style>