<template>
    <div id="search-bar">
        <div id="search-wrapper" @click="doSearch($event)">
            <div id="search-input">
                <label for="oeis">
                    <b>Search the encyclopedia</b>
                    (<a href="https://oeis.org" target="_blank">OEIS.org</a>):
                </label>
                <br>
                <input
                    id="oeis"
                    v-model="term"
                    type="text"
                    placeholder="id, keyword, etc..."
                    @input="doSearch($event)">
            </div>
            <button class="tooltip-anchor">
                <span class="help material-icons-sharp">help</span>
                <div class="desc-tooltip-text help-box shadowed">
                    Type a word, phrase, or sequence ID number. A list of
                    related OEIS sequences will pop up. Click on any item to
                    add it as a sequence option.
                </div>
            </button>
        </div>
        <div
            v-if="results.length"
            id="results-backdrop"
            @click="results = []" />
        <div v-if="results.length" id="oeis-results" class="shadowed">
            <p
                v-for="item in results"
                :key="item[0]"
                @click="select(item[0])">
                <a
                    v-if="item[0].startsWith('A')"
                    :href="`https://oeis.org/${item[0]}`"
                    class="mono"
                    target="_blank"
                    @click.stop>
                    {{ item[0] }}&nbsp;
                    <div class="info material-icons-sharp external">
                        launch
                    </div>
                </a>
                <span v-if="!item[0].startsWith('A')" class="mono">
                    {{ item[0] }}
                </span>
                <span class="result-desc">{{ item[1] }}</span>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
    import {OEIS} from '../sequences/OEIS'

    import axios from 'axios'
    import type {AxiosResponse} from 'axios'
    import {ref} from 'vue'

    const emit = defineEmits(['addSequence'])

    const term = ref('')
    const resultList: [string, string][] = []
    const results = ref(resultList)
    const resultCache: Record<string, typeof resultList> = {}
    const errResult = [
        ['....... ', 'search temporarily unavailable, please try again'],
    ] as typeof resultList

    async function doSearch(_e: Event) {
        if (term.value.length === 0) {
            results.value = []
            return
        }
        if (term.value in resultCache) {
            results.value = resultCache[term.value]
            return
        }
        const srch = term.value // make sure stays constant despite typing
        results.value = [['..???.. ', `... searching for ${srch} ...`]]
        const searchUrl =
            OEIS.urlPrefix + `search_oeis/${encodeURIComponent(srch)}`
        let searchResponse: AxiosResponse | undefined = undefined
        try {
            searchResponse = await axios.get(searchUrl)
        } catch {
            if (srch === term.value) results.value = errResult
            return
        }
        if (!searchResponse) {
            if (srch === term.value) results.value = errResult
            return
        }
        let reslt = searchResponse.data.results
        for (const pair of reslt)
            if (pair[0] === 'A000045') pair[1] = 'Virahāṅka-' + pair[1]
        if (reslt.length === 0) {
            reslt = [
                [
                    '....... ',
                    `search for ${srch} produced no results `
                        + 'or too many results',
                ],
            ]
        }
        resultCache[srch] = reslt
        if (srch === term.value) results.value = reslt
    }

    function select(id: string) {
        if (id.startsWith('A')) emit('addSequence', id)
        results.value = []
    }
</script>

<style scoped lang="scss">
    #search-bar {
        position: relative;
        min-width: 35%;
        display: flex;
        align-items: center;

        div {
            margin-right: 8px;
        }

        #search-wrapper {
            width: 100%;
            display: flex;
            border-bottom: var(--ns-color-black);
            border-bottom-width: 1px;
            border-bottom-style: solid;
            position: relative;
            z-index: 3;
        }

        #search-wrapper:focus-within {
            outline: none;
            border-bottom-color: var(--ns-color-primary);
        }

        #search-input {
            width: calc(100% - 24px);
        }

        label {
            font-size: var(--ns-size-subheading);
        }

        input[type='text'] {
            font-size: var(--ns-size-heading-2);
            margin-bottom: 0px;
            margin-right: 8px;
            border: none;
            padding: 2px 8px;
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
            border: none;
            background: none;
            position: relative;
            top: 8px;
            aspect-ratio: 1 / 1;
        }
    }

    #oeis-results {
        position: absolute;
        top: 43px;
        right: -8px;
        width: 200%;
        z-index: 3;
        background: var(--ns-color-white);
        cursor: pointer;

        .mono {
            font-family: monospace, monospace;
        }

        p {
            text-overflow: ellipsis;
            z-index: 3;
            overflow: hidden;
            white-space: nowrap;
            border: 1px solid var(--ns-color-black);
            padding: 4px;
            margin: 0px;
        }
    }

    #results-backdrop {
        position: fixed;
        z-index: 2;
        padding: 0;
        margin: 0;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.2);
    }

    .external {
        transform: scale(0.6);
        position: relative;
        top: 5px;
        left: -20px;
    }

    .result-desc:hover {
        background-color: color-mix(
            in srgb,
            var(--ns-color-primary),
            white 50%
        );
    }
</style>
