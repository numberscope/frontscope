<template>
    <div>
        <div class="container splashcontainer" id="home">
            <div class="maintitle">
                <h1 style="color: #f75c03">
                    <b>NUMBERSCOPE</b>
                    <br />
                    <!-- Vue does not respecct &nbsp; so must use a -->
                    <!-- JavaScript escape below:  :-(  -->
                    <span style="font-size: 50%; color: darkgreen">
                        THE ONLINE TOOL FOR VISUALIZING INTEGER{{
                            '\xa0'
                        }}SEQUENCES
                    </span>
                </h1>
                <router-link
                    :to="{name: 'Canvas'}"
                    type="button"
                    class="btn btn-warning">
                    Get Started!
                </router-link>
                <br />
                <br />
                By using this website, you agree that any images or media you
                create with its tools are released by you into the public
                domain according to
                <a href="https://creativecommons.org/publicdomain/zero/1.0/">
                    CC0 1.0</a
                >.
            </div>
        </div>
        <div class="row detailrow">
            <div class="col-md-4">
                <div class="container">
                    <img
                        src="@/assets/imgs/homepage/turtle.png"
                        style="width: 70%" />
                    <h2><b>Turtle Graphics</b></h2>
                </div>
                <p class="textorange">
                    Imagine a small turtle sitting on a paper. It can move
                    forward and rotate, and as it moves it leaves a trail of
                    ink behind it. The visualization of integer sequences with
                    turtle graphics can thus be constructed with parameters
                    from the numbers of given sequences. Most integer
                    sequences will produce mindless scribbling. Some produce
                    surprising geometric figures.
                </p>
            </div>
            <div class="col-md-4">
                <div class="container">
                    <img
                        src="@/assets/imgs/homepage/gof.png"
                        style="width: 70%" />
                    <h2><b>Game of Life</b></h2>
                </div>
                <p class="textorange">
                    The Game of Life is a cellular automaton model. The
                    playing field for Game of Life is a grid of cells. Each
                    cell can be either alive or dead and has eight neighbors,
                    those being the cells directly touching it horizontally,
                    vertically, and diagonally. Certain rules dictate whether
                    or not a given cell will be alive in the next generation.
                </p>
            </div>
            <div class="col-md-4">
                <div class="container">
                    <img
                        src="@/assets/imgs/homepage/sc.png"
                        style="width: 70%" />
                    <h2 style="width: 100%"><b>Shift Comparison</b></h2>
                </div>
                <p class="textorange">
                    The shift comparison picture of a<sub>n</sub> is formed by
                    setting the pixel at position (x,y) to be white if
                    a<sub>x</sub>=a<sub>x+y</sub>, and black otherwise. The
                    picture captures how a<sub>n</sub> repeats. Many
                    interesting sequences do not repeat, but by taking the
                    sequence mod n, that is, taking the remainders after
                    dividing by n, we get sequences that do repeat.
                </p>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Home',
    }
</script>

<style>
    .splashcontainer {
        max-width: 2500px;
        min-height: 375px;
        background-image: url('../assets/imgs/homepage/backgroundx.jpg');
        background-repeat: no-repeat;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .maintitle {
        text-align: center;
        font-size: small;
        color: grey;
        width: 55%;
    }
    .detailrow {
        padding: 50px;
        background-color: #809fff;
    }

    /* hover over to make background orange */
    .orange:hover {
        background-color: orange;
    }

    /* Hover to make text orange */
    .textorange:hover {
        color: orange;
    }
</style>
