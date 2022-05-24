<template>
    <div class="container" id="aboutContent">
        <h1>About Numberscope</h1>
        <p>
            Numberscope is a project in the University of Colorado Boulder's
            Experimental Mathematics lab. It is led by
            <a href="https://math.katestange.net/">Dr. Katherine E. Stange</a
            >, a number theorist and professor at CU Boulder and
            <a href="http://studioinfinity.org/">Dr. Glen Whitney</a>, founder
            of the National Museum of Mathematics in New York City and
            passionate promoter of math engagement and learning. Drs. Stange
            and Whitney and the rest of the Numberscope team are passionate
            about math education and open source projects.
        </p>
        <h2>Contributors</h2>
        <ul>
            <li>Abdullatif Khalid Abduljaleel</li>
            <li>Tobias Aldape</li>
            <li>Khaled Allen</li>
            <li>Isabel Anaya</li>
            <li>Sebastian Bozlee</li>
            <li>Brendan Heaney</li>
            <li>Steven Hristopoulos</li>
            <li>Ang Li</li>
            <li>Theodore Lincke</li>
            <li>Josiah Martinez</li>
            <li>Willem Mirkovich</li>
            <li>Liam Mulhall</li>
            <li>Daniel H. Taylor</li>
        </ul>
        <h2>
            <RouterLink to="/acknowledgements">Acknowledgements</RouterLink>
        </h2>
    </div>
</template>

<script lang="ts">
    import {RouterLink} from 'vue-router'
</script>

<style>
    #aboutContent {
        margin-top: 20px;
        margin-bottom: 20px;
    }
</style>
