<template>
    <div>
        <p>{{ param.displayName }}</p>
        <div class="input-container">
            <input
                v-if="param.type === ParamType.BOOLEAN"
                type="checkbox"
                v-bind:id="paramName"
                v-bind:checked="param.value === 'true'"
                v-on:input="updateBoolean($event)" />
            <input
                v-if="param.type === ParamType.COLOR"
                type="color"
                v-bind:id="paramName"
                v-bind:value="`${param.value}`"
                v-on:input="updateString($event)" />
            <select
                v-if="param.type === ParamType.ENUM"
                v-bind:id="paramName"
                v-bind:value="`${param.value}`"
                v-on:input="updateString($event)">
                <option
                    v-for="(value, name) in getEnumeration(param.from)"
                    v-bind:key="name"
                    v-bind:value="value">
                    {{ name }}
                </option>
            </select>
            <input
                v-else
                v-bind:id="paramName"
                v-bind:class="!status.isValid() ? 'error-field' : ''"
                v-bind:value="`${param.value}`"
                v-on:input="updateString($event)" />

            <div
                class="desc-tooltip"
                v-if="!param.hideDescription && param.description">
                <span class="material-icons-sharp">help</span>
                <div class="desc-tooltip-text">{{ param.description }}</div>
            </div>
        </div>
        <p v-if="param.hideDescription && param.description">
            {{ param.description }}
        </p>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'
    import type {ParamInterface} from '../shared/Paramable'
    import {ParamType} from '../shared/ParamType'
    import {ValidationStatus} from '../shared/ValidationStatus'

    export default defineComponent({
        name: 'ParamField',
        props: {
            param: {
                type: Object as () => ParamInterface,
                required: true,
            },
            paramName: {type: String, required: true},
            status: {
                type: Object as () => ValidationStatus,
                required: true,
            },
        },
        emits: ['updateParam'],
        methods: {
            getEnumeration(
                type: {[key: string]: number | string} | undefined
            ): {[key: string]: number} {
                if (!type) return {}

                const map: {[key: string]: number} = {}
                for (const prop in type)
                    if (typeof type[prop] === 'number')
                        map[prop] = type[prop] as number
                return map
            },
            updateBoolean(e: Event) {
                this.$emit(
                    'updateParam',
                    (e.target as HTMLInputElement).checked + ''
                )
            },
            updateString(e: Event) {
                this.$emit(
                    'updateParam',
                    (e.target as HTMLInputElement).value
                )
            },
        },
        data() {
            return {ParamType}
        },
    })
</script>

<style scoped>
    .input-container {
        display: flex;
        flex-direction: row;
    }

    .error-field {
        color: red;
    }

    .desc-tooltip {
        position: relative;
        display: inline-block;
        cursor: default;
    }

    .desc-tooltip .desc-tooltip-text {
        visibility: hidden;
        width: 240px;
        background-color: black;
        color: #fff;
        text-align: center;
        border-radius: 6px;
        padding: 5px 0;

        position: absolute;
        z-index: 1;
        bottom: 125%;
        left: 50%;
        margin-left: -120px;

        opacity: 0;
        transition:
            opacity 0.2s,
            visibility 0.2s;
    }

    .desc-tooltip:hover .desc-tooltip-text {
        visibility: visible;
        opacity: 1;
    }
</style>
