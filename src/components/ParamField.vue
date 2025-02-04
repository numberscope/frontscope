<template>
    <div>
        <div class="param-field">
            <label>
                {{ displayName }}
                <input
                    v-if="param.type === ParamType.BOOLEAN"
                    :id="paramName"
                    type="checkbox"
                    :checked="value === 'true'"
                    @input="updateBoolean($event)">
                <pick-colors
                    v-else-if="isColorful"
                    :id="paramName"
                    v-model:value="colorValue"
                    v-model:show-picker="showPicker"
                    :add-color="param.type === ParamType.COLOR_ARRAY"
                    @click="maybeTogglePicker"
                    @update:show-picker="reconcilePicker" />
                <select
                    v-else-if="param.type === ParamType.ENUM"
                    :id="paramName"
                    :value="value"
                    @input="updateString($event)">
                    <option
                        v-for="(val, name) in getEnumeration(param.from)"
                        :key="name"
                        :value="val">
                        {{ name }}
                    </option>
                </select>
                <input
                    v-else
                    :id="paramName"
                    type="text"
                    :class="!status.isValid() ? 'error-field' : ''"
                    :value="value"
                    :placeholder="placehold(param)"
                    @keyup.enter="blurField(paramName)"
                    @input="updateString($event)">
            </label>

            <div
                v-if="param.hideDescription && param.description"
                class="desc-tooltip">
                <span class="material-icons-sharp">help</span>
                <div class="desc-tooltip-text shadowed">
                    {{ param.description }}
                </div>
            </div>
        </div>
        <p
            v-if="!param.hideDescription && param.description"
            class="param-description">
            {{ param.description }}
        </p>
        <p v-for="error in status.errors" :key="error" class="error-message">
            {{ error }}
        </p>
        <p
            v-for="warning in status.warnings"
            :key="warning"
            class="warning-message">
            {{ warning }}
        </p>
    </div>
</template>

<script setup lang="ts">
    import {ref, watch} from 'vue'
    import PickColors from 'vue-pick-colors'

    import type {ParamInterface} from '../shared/Paramable'
    import {typeFunctions, ParamType} from '../shared/ParamType'
    import {ValidationStatus} from '../shared/ValidationStatus'

    const props = defineProps<{
        param: ParamInterface<ParamType>
        value: string
        paramName: string
        displayName: string
        status: ValidationStatus
    }>()

    const emit = defineEmits(['updateParam'])
    const isColorful =
        props.param.type === ParamType.COLOR
        || props.param.type === ParamType.COLOR_ARRAY

    function getEnumeration(
        type: {[key: string]: number | string} | undefined
    ): {[key: string]: number} {
        if (!type) return {}

        const map: {[key: string]: number} = {}
        for (const prop in type) {
            if (typeof type[prop] === 'number') map[prop] = +type[prop]
        }
        return map
    }

    function blurField(id: string) {
        window.document.getElementById(id)?.blur()
    }

    function updateBoolean(e: Event) {
        blurField(props.paramName)
        const inp = e.target as HTMLInputElement
        emit('updateParam', inp.checked + '')
    }

    function updateString(e: Event) {
        const t = e.target
        if (t instanceof HTMLSelectElement || t instanceof HTMLInputElement) {
            emit('updateParam', t.value)
        }
    }

    function rectifyColors(inVal: string) {
        return props.param.type === ParamType.COLOR_ARRAY
            ? inVal.split(/\s*[\s,]\s*/)
            : inVal
    }

    const colorValue = ref(rectifyColors(props.value))
    watch(
        () => props.value,
        () => {
            colorValue.value = rectifyColors(props.value)
        }
    )
    const showPicker = ref(false)
    function pickerKeys(e: KeyboardEvent) {
        if (e.key === 'Enter') togglePicker()
        else if (
            props.param.type === ParamType.COLOR_ARRAY
            && e.key === 'Delete'
        ) {
            const colorItems = Array.from(
                document.querySelectorAll(`#${props.paramName} .color-item`)
            )
            let selection = colorItems.findIndex(
                item => item instanceof HTMLElement && item.style.boxShadow
            )
            if (selection < 0) selection += colorItems.length
            const colorCopy = [...colorValue.value]
            colorCopy.splice(selection, 1)
            colorValue.value = colorCopy
            togglePicker()
        }
    }
    let firstClick = true
    function maybeTogglePicker(e: Event) {
        if (!isColorful) return
        const target = e.target as HTMLElement
        const index = target.dataset?.index
        if (
            index != null
            && index !== ''
            && ((props.param.type === ParamType.COLOR && !firstClick)
                || target.style.boxShadow)
        ) {
            togglePicker()
        }
        firstClick = false
    }
    function togglePicker() {
        showPicker.value = !showPicker.value
        reconcilePicker(showPicker.value)
    }
    function reconcilePicker(newShow: boolean) {
        if (newShow) {
            document.addEventListener('keyup', pickerKeys)
        } else {
            document.removeEventListener('keyup', pickerKeys)
            const newVal =
                typeof colorValue.value === 'string'
                    ? colorValue.value
                    : colorValue.value.join(' ')
            emit('updateParam', newVal)
        }
    }

    function placehold(par: ParamInterface<ParamType>) {
        if (typeof par.placeholder === 'string') return par.placeholder
        const stringifier = typeFunctions[par.type].derealize
        return stringifier.call(par, par.default as never)
    }
</script>

<style scoped lang="scss">
    label {
        font-size: 12px;
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
        &[type='color'] {
            vertical-align: middle;
        }
    }

    ::placeholder {
        color: grey;
        opacity: 0.5;
    }
    /* The below should be kept in sync with the above. Unfortunately,
       just adding `, ::-ms-input-placeholder` to the above selector did
       not work for reasons I do not understand.
     */
    ::-ms-input-placeholder {
        color: grey;
        opacity: 0.5;
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
        margin: 0px;
    }

    .param-field {
        display: flex;
        flex-direction: row;
        position: relative;

        .color-picker {
            vertical-align: middle;
        }
    }

    .error-field {
        color: red;
    }

    .error-message {
        color: red;
        font-size: var(--ns-size-body);
    }

    .warning-message {
        color: orange;
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
        bottom: 0px;
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
