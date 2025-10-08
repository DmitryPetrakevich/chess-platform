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
.play {
    margin-top: 50px;
}

.board_chess {
    display: flex;
    flex-direction: row;
    justify-content: center;
    
    
}


</style>