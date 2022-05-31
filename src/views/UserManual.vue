<!-- When you remove this file, remember to also remove this file from
ignorePatterns in .eslintrc.cjs. -->

<template>
    <div>
        <div class="container" style="max-width: 2500px" id="home">
            <img class="mx-auto background" :src="background200px" />
            <div class="centered carousel-caption">
                <h1>
                    <span style="color: #f75c03">
                        <b>USER MANUALS</b>
                    </span>
                    <br />
                </h1>
            </div>
        </div>
        <div class="row" style="paddingtop: 50px; backgroundcolor: #809fff">
            <!--left box-->
            <div class="col-md-4 side">
                <div class="container">
                    <h2><b>Scopes</b></h2>
                </div>

                <div>
                    <button v-on:click="swapManual('differences')">
                        Differences
                    </button>
                </div>

                <div>
                    <button v-on:click="swapManual('modFill')">
                        Mod Fill
                    </button>
                </div>

                <div>
                    <button v-on:click="swapManual('shiftCompare')">
                        Shift Compare
                    </button>
                </div>

                <div>
                    <button v-on:click="swapManual('turtle')">Turtle</button>
                </div>
            </div>

            <!--right box-->
            <div class="col-md-8 page">
                <h2>{{ tool }}</h2>
                <br />

                <h5>Parameters</h5>
                <ul>
                    <li v-for="p in params" v-bind:key="p.text">
                        {{ p.text }}
                    </li>
                </ul>
                <br />
                <p>
                    {{ desc }}
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import background200px from '../assets/img/homepage/background200px.jpg'
    export default {
        name: 'UserManual',
        data() {
            return {
                tool: 'Tool',
                params: [] as {text: string}[], // get the type correct
                desc: 'Select a tool on the left to learn about it.',
                background200px: background200px,
            }
        },
        methods: {
            swapManual: function (manual: string) {
                switch (manual) {
                    case 'differences':
                        this.tool = 'Differences'
                        this.desc = ''
                        this.params = [
                            {text: 'n: number. Number of elements used.'},
                            {text: 'Levels: number.'},
                        ]
                        break
                    case 'modFill':
                        this.tool = 'Mod Fill'
                        this.desc = ''
                        this.params = [{text: 'Mod Dimensions: number.'}]
                        break
                    case 'shiftCompare':
                        this.tool = 'Shift Compare'
                        this.desc = [
                            'Draws an image of x and y dimensions.',
                            "Using each pixel's coordinates as indices",
                            'into the sequence, compares the two elements,',
                            'and if they are congruent (in the given',
                            'modulus), colors the corresponding pixel',
                            'white, or black otherwise.',
                        ].join(' ')
                        this.params = [
                            {
                                text: [
                                    'No external parameters.',
                                    "Press 'up' and 'down' arrow keys",
                                    'to increase and decrease the',
                                    'modulus, respectively.',
                                ].join(' '),
                            },
                        ]
                        break
                    case 'turtle':
                        this.tool = 'Turtle'
                        this.desc = [
                            'Draws a polygonal curve, turning after each',
                            'segment by an angle corresponding to the',
                            'next value in the sequence.',
                        ].join(' ')
                        this.params = [
                            {
                                text: [
                                    'Domain: a comma-separated list',
                                    'of numbers, including all possible',
                                    'values that may occur in the sequence.',
                                    'One way to ensure that there are only',
                                    'a small number of possible values is',
                                    'to take remainders of your sequence in',
                                    'a small modulus.',
                                ].join(' '),
                            },
                            {
                                text: [
                                    'Range: a comma-separated list',
                                    'of numbers. These are turning angles,',
                                    'corresponding positionally to the',
                                    'domain elements. Range and domain',
                                    'must be the same length.',
                                ].join(' '),
                            },
                            {
                                text: [
                                    'Step Size: a number. Gives the length',
                                    'of the segment drawn for each entry.',
                                ].join(' '),
                            },
                            {
                                text: [
                                    'Stroke Weight: a number. Gives the width',
                                    'of the segment drawn for each entry.',
                                ].join(' '),
                            },
                            {
                                text: [
                                    'Starting X/Y: numbers. These give the',
                                    'coordinates of the starting positon.',
                                ].join(' '),
                            },
                        ]
                        break
                    default:
                        this.tool = 'Tool'
                        this.desc = [
                            'Select a tool on the left to learn about it.',
                        ].join(' ')
                        this.params = []
                        break
                }
            },
        },
    }
</script>

<style>
    .background {
        width: 100%;
    }
    /* Text inside image TODO change this
   to background image, I wasnt having luck*/
    .centered {
        position: absolute;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    /* hover over to make background orange */
    .orange:hover {
        background-color: orange;
    }
    /* sidebar */
    .side {
        background-color: #f75c03;
    }
    /* user manual selector buttons */
    .side button {
        padding: 5px;
        width: 250px;
        border: none;
        margin: 5px;
    }
    .side button:hover {
        background-color: #809fff;
    }
    /* main manual style */
    .page {
        padding-top: 50px;
        padding-left: 50px;
        text-align: left;
        height: 600px;
        background-color: white;
        border: 2px solid #809fff;
    }
    /* Hover to make text orange */
    .textorange:hover {
        color: orange;
    }
</style>
