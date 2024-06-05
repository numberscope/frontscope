<script setup lang="ts">
    import {showChangeModal} from '@/shared/showChangeModal'
</script>

<script lang="ts">
    import {defineComponent, type PropType} from 'vue'
    import type {ModalType} from '@/shared/modalType'

    export default defineComponent({
        name: 'ChangeButton',
        props: {
            modalType: {type: Number as PropType<ModalType>, required: true},
        },
    })
</script>

<template>
    <div class="changeModalButton" @click="showChangeModal.open(modalType)">
        <img src="../assets/img/change.svg" alt="Change button" />
        <p>Change {{ modalType === 0 ? 'Sequence' : 'Visualizer' }}</p>
    </div>
</template>

<style scoped>
    p {
        font-size: var(--ns-size-mini);
        margin: 0;
        text-align: center;
    }

    img {
        display: block;
        margin: auto auto 4px;
    }

    .changeModalButton {
        display: inline-block;
        width: min-content;
        padding: 4px;
        cursor: pointer;
        border-style: solid;
        border-width: 1px;
        border-color: var(--ns-color-white);
    }
    .changeModalButton:hover {
        border-color: var(--ns-color-light);
    }
</style>
