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
                    show-alpha
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
                <textarea
                    v-else-if="param.type === ParamType.FORMULA"
                    :id="paramName"
                    :class="!status.isValid() ? 'error-field' : ''"
                    :value="value"
                    :placeholder="placehold(param)"
                    @input="updateString($event)" />
                <input
                    v-else
                    :id="paramName"
                    type="text"
                    :class="!status.isValid() ? 'error-field' : ''"
                    :value="value"
                    :placeholder="placehold(param)"
                    @keyup.enter="blurField($event)"
                    @input="updateString($event)">
            </label>

            <div
                v-if="param.hideDescription && param.description"
                class="desc-tooltip">
                <span
                    class="material-icons-sharp"
                    @mouseenter="popHelp"
                    @mouseleave="hideHelp">help</span>
                <Teleport to="body">
                    <div ref="helpText" class="desc-tooltip-text shadowed">
                        {{ param.description }}
                    </div>
                </Teleport>
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
    import {ref, onMounted, useTemplateRef, watch} from 'vue'
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

    const helpPopup = useTemplateRef('helpText')
    function popHelp(e: Event) {
        const help = helpPopup?.value
        if (!help) return
        help.style.opacity = '1'
        help.style.visibility = 'visible'
        if (e.target instanceof HTMLSpanElement) {
            const rect = e.target.getBoundingClientRect()
            const popHeight = help.offsetHeight
            if (rect.top > popHeight) {
                help.style.top = rect.top - popHeight - 4 + 'px'
                help.style.right = '8px'
            } else if (rect.bottom + popHeight + 4 < window.innerHeight) {
                help.style.top = rect.bottom + 4 + 'px'
                help.style.right = '8px'
            } else {
                help.style.top = '0px'
                help.style.right = '42px'
            }
        }
    }
    function hideHelp() {
        if (!helpPopup?.value) return
        helpPopup.value.style.opacity = '0'
        helpPopup.value.style.visibility = 'hidden'
    }

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

    function blurField(e: Event) {
        const field = e.target
        if (field instanceof HTMLElement) field.blur()
    }

    function growArea(area: HTMLTextAreaElement) {
        if (area.scrollHeight > area.offsetHeight) {
            area.style.height = `${area.scrollHeight + 3}px`
        }
    }

    onMounted(() => {
        if (props.param.type === ParamType.FORMULA) {
            const field = document.getElementById(props.paramName)
            if (field instanceof HTMLTextAreaElement) growArea(field)
        }
    })

    function updateBoolean(e: Event) {
        blurField(e)
        const inp = e.target as HTMLInputElement
        emit('updateParam', inp.checked + '')
    }

    function updateString(e: Event) {
        const t = e.target
        if (
            t instanceof HTMLSelectElement
            || t instanceof HTMLInputElement
            || t instanceof HTMLTextAreaElement
        ) {
            emit('updateParam', t.value)
            if (t instanceof HTMLTextAreaElement) growArea(t)
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
            if (colorItems.length < 2) {
                // Attempt to delete last remaining color, but there must
                // be at least one, so turn it white
                colorValue.value = ['#FFFFFF']
            } else {
                let selection = colorItems.findIndex(
                    item =>
                        item instanceof HTMLElement && item.style.boxShadow
                )
                if (selection < 0) selection += colorItems.length
                // Can't directly splice a ref()d list, goes haywire, so
                // instead copy and assign
                const colorCopy = [...colorValue.value]
                colorCopy.splice(selection, 1)
                colorValue.value = colorCopy
            }
            togglePicker()
        }
    }
    let pickerJustPopped = false
    function maybeTogglePicker(e: Event) {
        if (!isColorful) return
        const target = e.target as HTMLElement
        const index = target.dataset?.index
        if (props.param.type === ParamType.COLOR) {
            if (pickerJustPopped) pickerJustPopped = false
            else togglePicker()
        } else if (index != null && index !== '' && target.style.boxShadow) {
            togglePicker()
        }
    }
    function togglePicker() {
        showPicker.value = !showPicker.value
        reconcilePicker(showPicker.value)
    }
    let lastShowed = false
    function reconcilePicker(newShow: boolean) {
        if (newShow) {
            if (!lastShowed) {
                document.addEventListener('keyup', pickerKeys)
                pickerJustPopped = true
                lastShowed = true
            } else if (pickerJustPopped) {
                pickerJustPopped = false
            }
        } else {
            document.removeEventListener('keyup', pickerKeys)
            pickerJustPopped = false
            lastShowed = false
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

    textarea {
        display: block;
        border: none;
        border-bottom: 1.5px solid var(--ns-color-black);
        padding-bottom: 0px;
        margin: 0px;
        width: 100%;
        height: 30px;
        font-size: 14px;
        resize: vertical;
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
        top: 4px;
    }

    .desc-tooltip-text {
        width: 240px;
        background-color: var(--ns-color-white);
        color: var(--ns-color-black);
        text-align: left;
        border: 1px solid var(--ns-color-black);
        padding: 8px;
        font-size: 12px;

        position: fixed;
        z-index: 99;
        right: 0;
        margin-left: -120px;

        opacity: 0;
        visibility: hidden;
        transition:
            opacity 0.2s,
            visibility 0.2s;
    }
</style>
