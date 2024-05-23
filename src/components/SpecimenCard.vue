<template>
    <div class="card-body">
        <div class="card-preview" :id="cid"></div>
        <div class="card-title-box">
            <h5 class="card-title">
                {{ `${cardName}` }}
            </h5>
            <p class="card-text">
                {{ seqName }}
            </p>
        </div>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'
    let cid_count = 0
    export default defineComponent({
        name: 'SpecimenCard',
        methods: {},
        props: {
            seqName: {type: String, required: true},
            cardName: {type: String, required: true},
            cid: {
                type: String,
                default: function () {
                    return 'Card-' + cid_count++
                },
            },
        },
    })
</script>

<style scoped>
    .card-body {
        width: 216px;
        border: 1px solid var(--ns-color-black);
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .card-preview {
        width: 200px;
        height: 200px;
        margin: 8px;
        background-color: #f8f9fa;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .card-title-box {
        width: 100%;
        border-top: 1px solid var(--ns-color-black);
        align-items: left;
        text-align: left;
    }
    .card-title {
        font-size: 14px;
        font-weight: var(--ns-font-weight-medium);
        margin-left: 8px;
        margin-bottom: 2px;
        margin-top: 8px;
    }
    .card-text {
        font-size: 12px;
        margin-top: 2px;
        margin-left: 8px;
        margin-bottom: 8px;
        color: #6c757d;
    }
</style>
