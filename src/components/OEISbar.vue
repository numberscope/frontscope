<template>
    <div id="search-bar">
        <div>
            <label for="oeis">Search the OEIS</label>
            <br />
            <input type="text" id="oeis" placeholder="id, keyword, etc..." />
        </div>
        <button class="material-icons-sharp">search</button>
    </div>
</template>

<script setup lang="ts">
    const emit = defineEmits(['addID'])
    console.log(emit)
</script>

<style scoped lang="scss">
    #search-bar {
        display: flex;
        align-items: center;

        div {
            margin-right: 8px;
        }

        label {
            font-size: var(--ns-size-subheading);
        }

        input[type='text'] {
            font-size: var(--ns-size-heading-2);
            margin-bottom: 8px;
            margin-right: 8px;
            border: none;
            border-bottom: var(--ns-color-black);
            border-bottom-width: 1px;
            border-bottom-style: solid;
            padding: 6px 8px;
        }
        input[type='text']:focus {
            outline: none;
            border-bottom-color: var(--ns-color-primary);
        }
        input[type='text']::placeholder {
            color: var(--ns-color-light);
        }

        button {
            font-size: 24px;
            border: 1px solid var(--ns-color-black);
            background: none;
            aspect-ratio: 1 / 1;
        }
    }
</style>
