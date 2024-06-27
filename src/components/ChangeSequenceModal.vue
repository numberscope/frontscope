<template>
    <div id="background" @click.self="closeModal()">
        <div id="modal">
            <div id="bar">
                <button class="material-icons-sharp" @click="closeModal()">
                    close
                </button>
            </div>

            <div id="content">
                <h1>Change Sequence</h1>

                <h4>Import from the OEIS</h4>
                <div id="search-bar">
                    <div>
                        <label for="oeis-id">OEIS ID</label><br />
                        <input
                            type="text"
                            id="oeis-id"
                            placeholder="A037161" />
                    </div>
                    <div style="width: 50%">
                        <label for="oeis-name">Sequence Alias</label><br />
                        <input
                            type="text"
                            id="oeis-name"
                            placeholder="Prime Numbers" />
                    </div>
                    <div>
                        <label for="oeis-cache">Number of Elements</label>
                        <input type="text" id="oeis-cache" value="1000" />
                    </div>
                    <div>
                        <label for="oeis-mod">Modulus</label>
                        <input type="text" id="oeis-mod" value="0" />
                    </div>
                    <button
                        class="material-icons-sharp"
                        @click="importOEIS"
                        style="cursor: pointer">
                        add
                    </button>
                </div>
                <span
                    v-if="error.message.length > 0"
                    style="color: red; font-size: var(--ns-size-body)">
                    {{ error.message }}
                </span>

                <h4>Loaded Sequences</h4>
                <div id="results">
                    <div
                        class="sequence"
                        v-for="(sequence, name) in reactiveSeqMODULES"
                        :key="name"
                        @click="changeSequence(name as string), closeModal()">
                        <h2>{{ sequence.name }}</h2>
                        <p>{{ sequence.description }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import {SequenceExportModule} from '@/sequences/SequenceInterface'
    import seqMODULES from '../sequences/sequences'
    import OEISSequence from '@/sequences/OEIS'
    import {reactive} from 'vue'
    const emit = defineEmits(['close', 'change'])

    const reactiveSeqMODULES = reactive({...seqMODULES})
    const error = reactive({message: ''})

    const props = defineProps(['specimen'])
    function changeSequence(key: string) {
        props.specimen!.sequence = key
        emit('change')
    }

    function closeModal() {
        error.message = ''
        emit('close')
    }

    function importOEIS() {
        // Determine the desired values for the OEIS sequence
        const name = (
            document.getElementById('oeis-name')! as HTMLInputElement
        ).value
        const oeisId = (
            document.getElementById('oeis-id')! as HTMLInputElement
        ).value
        const cacheBlock = (
            document.getElementById('oeis-cache')! as HTMLInputElement
        ).value
        const modulus = (
            document.getElementById('oeis-mod')! as HTMLInputElement
        ).value

        if (!oeisId.match(/^[A-Z]\d{6}$/)) {
            error.message = "OEIS ID must be of the form 'Annnnnn'"
            return
        }
        if (!cacheBlock.match(/^\d+$/)) {
            error.message =
                'Number of elements must be a non-negative integer'
            return
        }
        if (!modulus.match(/^\d+$$/)) {
            error.message = 'Modulus must be a non-negative integer'
            return
        }

        // Generate the sequence from these values and its corresponding key
        const sequence = new OEISSequence(
            0,
            name,
            oeisId,
            Number.parseInt(cacheBlock),
            BigInt(Number.parseInt(modulus))
        )
        const key = sequence.toSequenceExportKey()

        // If this sequence hasn't already been generated, add it to the
        // sequence export modules
        if (!(key in seqMODULES)) {
            const exportModule = SequenceExportModule.instance(sequence)
            seqMODULES[key] = exportModule
            reactiveSeqMODULES[key] = exportModule
        }

        // Select this sequence and close the modal
        // NOTE: this functionality can be removed if not desired
        changeSequence(key)
        closeModal()
    }
</script>

<style scoped lang="scss">
    h1 {
        font-size: var(--ns-size-title);
        margin-bottom: 16px;
        margin-top: 0;
    }

    .sequence {
        width: 216px;
        height: 216px;
        background-color: var(--ns-color-white);
        padding: 10px;
        border: 1px solid black;
        color: var(--ns-color-black);
        cursor: pointer;
    }
    .sequence p {
        font-size: var(--ns-size-subheading);
        color: var(--ns-color-black);
    }
    .sequence h2 {
        color: var(--ns-color-black);
        font-size: var(--ns-size-heading);
    }

    #background {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3);
    }

    #content {
        padding: 16px;
        padding-top: 0;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: calc(100% - 48px);
    }

    #modal {
        max-width: 900px;
        width: 100%;
        height: 100%;
        background-color: var(--ns-color-white);
        display: flex;
        flex-direction: column;
    }

    #bar {
        height: 48px;
        padding: 16px;
        background-color: var(--ns-color-white);
        display: flex;
        justify-content: end;
        align-items: center;

        button {
            font-size: 24px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: var(--ns-color-black);
        }
    }

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
            margin-bottom: 16px;
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

    #results {
        display: flex;
        flex-wrap: wrap;
        overflow: auto;
        flex: 1;
        gap: 16px;
    }

    @media (min-width: 850px) {
        #bar {
            display: flex;
            background-color: var(--ns-color-primary);
            height: 24px;
            padding: 0;

            button {
                color: var(--ns-color-white);
                font-size: 16px;
            }
        }

        #content {
            height: calc(100% - 24px);
            padding-top: 16px;
        }

        #modal {
            max-height: 80%;
        }
    }
</style>
