<template>
    <div style="margin-bottom: 32px">
        <p
            v-if="!param.hideDescription && param.description"
            class="param-description">
            {{ param.description }}
        </p>
        <div class="input-container">
            <label>
                {{ param.displayName }}
                <input
                    v-if="param.type === ParamType.BOOLEAN"
                    type="checkbox"
                    v-bind:id="paramName"
                    v-bind:checked="value === 'true'"
                    v-on:input="updateBoolean($event)" />
                <input
                    v-else-if="param.type === ParamType.COLOR"
                    type="color"
                    v-bind:id="paramName"
                    v-bind:value="value"
                    v-on:input="updateString($event)" />
                <select
                    v-else-if="param.type === ParamType.ENUM"
                    v-bind:id="paramName"
                    v-bind:value="value"
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
                    type="text"
                    v-bind:id="paramName"
                    v-bind:class="!status.isValid() ? 'error-field' : ''"
                    v-bind:value="value"
                    v-on:input="updateString($event)" />
            </label>

            <div
                class="desc-tooltip"
                v-if="param.hideDescription && param.description">
                <span class="material-icons-sharp">help</span>
                <div class="desc-tooltip-text">{{ param.description }}</div>
            </div>
        </div>
        <p
            class="error-message"
            v-for="error in status.errors"
            v-bind:key="error">
            {{ error }}
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
                type: Object as () => ParamInterface<ParamType>,
                required: true,
            },
            value: {
                type: String,
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

<style scoped lang="scss">
    label {
        font-size: 12px;
        width: 100%;
    }

    input {
        &[type='text'] {
            border: none;
            border-bottom: 1.5px solid var(--ns-color-black);
            font-size: 14px;
            padding: 6px 8px 6px 8px;
            width: 100%;

            &:focus {
                border-bottom: 1.5px solid var(--ns-color-primary);
                outline: none;
            }
        }
    }

    select {
        border: 1px solid var(--ns-color-black);
        background-color: var(--ns-color-white);
        display: block;
        width: 100%;
        padding: 8px;
        margin-top: 4px;

        &:focus {
            outline: 3px solid var(--ns-color-primary);
            border: none;
        }
    }

    .param-description {
        font-size: 12px;
        color: var(--ns-color-grey);
        margin-bottom: 8px;
        margin-top: 0px;
    }

    .input-container {
        display: flex;
        flex-direction: row;
        position: relative;
    }

    .error-field {
        color: red;
    }

    .error-message {
        color: red;
        font-size: var(--ns-size-body);
    }

    .desc-tooltip {
        position: absolute;
        display: inline-block;
        cursor: default;

        .material-icons-sharp {
            font-size: 16px;
            color: var(--ns-color-grey);
        }

        right: 4px;
        bottom: 4px;
    }

    .desc-tooltip .desc-tooltip-text {
        visibility: hidden;
        width: 240px;
        background-color: var(--ns-color-white);
        color: var(--ns-color-black);
        text-align: left;
        border: 1px solid var(--ns-color-black);
        padding: 8px;
        font-size: 12px;

        position: absolute;
        z-index: 1;
        bottom: 125%;
        right: 0;
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
