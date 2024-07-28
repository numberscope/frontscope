<template>
    <div id="search-bar">
        <div>
            <label for="oeis">Search the OEIS</label>
            <br />
            <input
                type="text"
                id="oeis"
                v-model="term"
                v-on:input="doSearch($event)"
                placeholder="id, keyword, etc..." />
        </div>
        <button class="material-icons-sharp" @click="srch">search</button>
        <div v-if="results.length" id="oeis-results">
            <p
                v-for="item in results"
                :key="item[0]"
                @click="select(item[0])">
                <a
                    v-if="item[0].startsWith('A')"
                    :href="`https://oeis.org/${item[0]}`"
                    @click.stop
                    target="_blank">
                    {{ item[0] }}
                </a>
                <span v-if="!item[0].startsWith('A')"> {{ item[0] }} </span>
                &nbsp; {{ item[1] }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
    import {OEIS} from '../sequences/OEIS'

    import axios from 'axios'
    import {ref} from 'vue'

    const emit = defineEmits(['addID'])

    const term = ref('')
    const resultList: [string, string][] = []
    const results = ref(resultList)

    function srch() {
        window.alert('Searching for ' + term.value)
    }

    async function doSearch(_e: Event) {
        if (term.value.length === 0) {
            results.value = []
            return
        }
        results.value = [['..???..', `... searching for ${term.value} ...`]]
        const searchUrl =
            OEIS.urlPrefix + `search_oeis/${encodeURIComponent(term.value)}`
        const searchResponse = await axios.get(searchUrl)
        const reslt = searchResponse.data.results
        for (const pair of reslt)
            if (pair[0] === 'A000045') pair[1] = 'Virahāṅka-' + pair[1]
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
            margin-bottom: 8px;
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
    #oeis-results {
        position: absolute;
        top: 50px;
        right: -8px;
        width: 200%;
        z-index: 2;
        background: var(--ns-color-white);

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
