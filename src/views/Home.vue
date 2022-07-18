<template>
    <div id="homeContent">
        <RouterLink to="/scope">
            <img :src="background4" id="background4" />
        </RouterLink>
        <p id="numberscopeDescription">
            The Online Tool for Visualizing Integer Sequences
        </p>
        <RouterLink class="btn btn-primary" to="/scope">
            Go to the 'Scope
        </RouterLink>
        <p class="mt-4">
            By using this website, you agree that any images or media you
            create using the tools on this website are released by you into
            the public domain according to
            <a href="https://creativecommons.org/publicdomain/zero/1.0/"
                >CC0 1.0</a
            >.
        </p>
        <div>
            <div class="row" id="visualizerInfo">
                <div class="col">
                    <img class="visualizerImg" :src="gameOfLife" />
                    <h2 class="mt-4 visualizerTitle"><b>Game of Life</b></h2>
                    <p class="orangeText">
                        The Game of Life is a cellular automaton model. The
                        playing field for Game of Life is a grid of cells.
                        Each cell can be either alive or dead and has eight
                        neighbors, those being the cells directly touching it
                        horizontally, vertically, and diagonally. Certain
                        rules dictate whether or not a given cell will be
                        alive in the next generation.
                    </p>
                </div>
                <div class="col">
                    <img class="visualizerImg" :src="shiftCompare" />
                    <h2 class="mt-4 visualizerTitle">
                        <b>Shift Comparison</b>
                    </h2>
                    <p class="orangeText">
                        The shift comparison picture of a<sub>n</sub> is
                        formed by setting the pixel at position (x,y) to be
                        white if a<sub>x</sub>=a<sub>x+y</sub>, and black
                        otherwise. The picture captures how a<sub>n</sub>
                        repeats. Many interesting sequences do not repeat, but
                        by taking the sequence mod n, that is, taking the
                        remainders after dividing by n, we get sequences that
                        do repeat.
                    </p>
                </div>
                <div class="col">
                    <img class="visualizerImg" :src="turtle" />
                    <h2 class="mt-4 visualizerTitle">
                        <b>Turtle Graphics</b>
                    </h2>
                    <p class="orangeText">
                        Imagine a small turtle sitting on a paper. It can move
                        forward and rotate, and as it moves it leaves a trail
                        of ink behind it. The visualization of integer
                        sequences with turtle graphics can thus be constructed
                        with parameters from the numbers of given sequences.
                        Most integer sequences will produce mindless
                        scribbling. Some produce surprising geometric figures.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import {RouterLink} from 'vue-router'
    import background4 from '../assets/img/toolpage/background4.jpg'
    import gameOfLife from '../assets/img/homepage/gof.png'
    import shiftCompare from '../assets/img/homepage/sc.png'
    import turtle from '../assets/img/homepage/turtle.png'
</script>

<style>
    #homeContent {
        margin-top: 2em;
        text-align: center;
    }
    #background4 {
        border: solid black;
        border-radius: 10%;
        max-width: 50%;
    }
    #numberscopeDescription {
        margin-top: 2em;
        margin-bottom: 2em;
        font-weight: bold;
        font-size: large;
    }
    #visualizerInfo {
        background-color: #809fff;
        color: white;
        margin-top: 2em;
        padding: 4em;
    }
    .visualizerImg {
        width: 70%;
    }
    @media only screen and (max-width: 600px) {
        #background4 {
            max-width: 90%;
        }
    }
</style>
