<script setup lang="ts">
    import {showChangeModal} from '@/shared/showChangeModal'
</script>

<template>
    <div id="background" @click.self="showChangeModal.close">
        <div id="modal">
            <div id="bar">
                <div id="cross" @click="showChangeModal.close"></div>
            </div>

            <div id="content">
                <h1>Change Sequence</h1>
                <div>
                    <button class="active">Browse</button>
                    <button>Saved Sequences</button>
                </div>

                <div>
                    <label for="oeis">Search the OEIS</label><br />
                    <input type="text" id="oeis" />
                    <div id="search"></div>
                </div>

                <div id="results">
                    <div class="sequence"></div>
                    <div class="sequence"></div>
                    <div class="sequence"></div>
                    <div class="sequence"></div>
                    <div class="sequence"></div>
                    <div class="sequence"></div>
                    <div class="sequence"></div>
                    <div class="sequence"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    * {
        margin: 0;
        padding: 0;
    }
    h1 {
        font-size: var(--ns-size-title);
        margin-bottom: 16px;
    }
    button {
        font-size: var(--ns-size-heading-2);
        margin-bottom: 16px;
        background-color: var(--ns-color-white);
        border: none;
        padding: 4px;
        margin-right: 16px;
        cursor: pointer;
    }
    .active {
        border-bottom: var(--ns-color-black);
        border-bottom-width: 1px;
        border-bottom-style: solid;
    }
    label {
        font-size: var(--ns-size-subheading);
    }
    input[type='text'] {
        font-size: var(--ns-size-heading-2);
        margin-bottom: 16px;
        margin-right: 8px;
        border: none;
        border-bottom: var(--ns-color-black);
        border-bottom-width: 1px;
        border-bottom-style: solid;
        padding: 6px 8px;
        width: 328px;
    }
    input[type='text']:focus {
        outline: none;
        border-bottom-color: var(--ns-color-primary);
    }

    .sequence {
        width: 216px;
        height: 268px;
        background-color: black;
    }

    #background {
        position: fixed;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        flex: 1;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3);
    }

    #modal {
        width: 990px;
        height: 647px;
        background-color: var(--ns-color-white);
        margin: 32px;
    }

    #bar {
        height: 24px;
        background-color: var(--ns-color-primary);
    }
    #cross {
        height: 16px;
        width: 16px;
        background-color: black;
        float: right;
        margin-top: 4px;
        margin-right: 4px;
        cursor: pointer;
    }

    #content {
        padding: 32px;
        display: flex;
        flex-direction: column;
        height: 623px;
    }

    #search {
        display: inline-block;
        width: 29px;
        height: 29px;
        background-color: black;
        vertical-align: top;
    }

    #results {
        display: flex;
        flex-wrap: wrap;
        overflow: auto;
        flex: 1;
        gap: 16px;
    }
</style>
