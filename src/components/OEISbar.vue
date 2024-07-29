<template>
    <div id="search-bar">
        <div id="search-wrapper" @click="doSearch($event)">
            <div id="search-input">
                <label for="oeis">
                    <b>Search the encyclopedia</b>
                    (<a href="https://oeis.org">OEIS.org</a>):
                </label>
                <br />
                <input
                    type="text"
                    id="oeis"
                    v-model="term"
                    v-on:input="doSearch($event)"
                    placeholder="id, keyword, etc..." />
            </div>
            <button class="tooltip-anchor">
                <MageSearchSquare />
                <div class="desc-tooltip-text help-box">
                    Type a word, phrase, or sequence ID number. A list of
                    related OEIS sequences will pop up. Click on any item to
                    add it as a sequence option.
                </div>
            </button>
        </div>
        <div v-if="results.length" id="oeis-results">
            <p
                v-for="item in results"
                :key="item[0]"
                @click="select(item[0])">
                <a
                    v-if="item[0].startsWith('A')"
                    :href="`https://oeis.org/${item[0]}`"
                    class="mono"
                    @click.stop
                    target="_blank">
                    {{ item[0] }}
                </a>
                <span class="mono" v-if="!item[0].startsWith('A')">
                    {{ item[0] }}
                </span>
                &nbsp; {{ item[1] }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
    import {OEIS} from '../sequences/OEIS'
    import MageSearchSquare from './MageSearchSquare.vue'

    import axios from 'axios'
    import {ref} from 'vue'

    const emit = defineEmits(['addID'])

    const term = ref('')
    const resultList: [string, string][] = []
    const results = ref(resultList)
    const resultCache: Record<string, typeof resultList> = {}

    async function doSearch(_e: Event) {
        if (term.value.length === 0) {
            results.value = []
            return
        }
        if (term.value in resultCache) {
            results.value = resultCache[term.value]
            return
        }
        results.value = [['..???..', `... searching for ${term.value} ...`]]
        const searchUrl =
            OEIS.urlPrefix + `search_oeis/${encodeURIComponent(term.value)}`
        const searchResponse = await axios.get(searchUrl)
        const reslt = searchResponse.data.results
        for (const pair of reslt)
            if (pair[0] === 'A000045') pair[1] = 'Virahāṅka-' + pair[1]
        resultCache[term.value] = reslt
        results.value = reslt
    }

    function select(id: string) {
        emit('addID', id)
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
        top: 50px;
        right: -8px;
        width: 200%;
        z-index: 2;
        background: var(--ns-color-white);

        .mono {
            font-family: monospace, monospace;
        }

        p {
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            border: 1px solid var(--ns-color-black);
            padding: 4px;
            margin: 0px;
        }
    }
</style>
