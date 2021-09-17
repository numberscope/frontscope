<template>
    <div id="drawing-stop-btn">
        <a href="#" v-on:click="$emit('stopDrawing')" aria-label="Back" class="list-group-item list-group-item-action">
            &#8249; Back
        </a>
    </div>
</template>

<script>
export default {
    props: {
        buttonText: String,
    },
}
</script>

<style scoped>
.back-btn {
    cursor: pointer;
}

</style>