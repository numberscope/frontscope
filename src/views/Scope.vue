<template>
    <div>
        <p>Scope page will be here</p>
        <button v-on:click="doThing()">Click here</button>
        <button v-on:click="doThing2()">Click here</button>
        <ParamEditor title="Visualizer" :paramable="paramable" />
        <!-- Insert HTML here -->
    </div>
</template>

<script setup lang="ts">
    import ParamEditor from '@/components/ParamEditor.vue'
    import vizMODULES from '@/visualizers/visualizers'
    import {exportModule} from '@/sequences/Constant'
    import type {SequenceConstructor} from '@/sequences/SequenceInterface'
    import {reactive} from 'vue'

    const paramable = reactive(
        new vizMODULES['Chaos'].visualizer(
            new (exportModule.constructorOrSequence as SequenceConstructor)(0)
        )
    )

    const doThing = () => {
        console.log(paramable)
    }
    const doThing2 = () => {
        paramable.params.colorStyle.value =
            ((paramable.params.colorStyle.value as number) + 1) % 4
    }
</script>

<style lang="scss" scoped></style>
