<script setup lang="ts">
    import {RouterLink} from 'vue-router'
    import LogoWithMicroscope from '../../assets/img/LogoWithMicroscope.png'
</script>

<template>
    <header>
        <nav class="navbar navbar-expand-lg navbar-dark navbar-custom">
            <div class="container-fluid">
                <RouterLink class="navbar-brand" to="/">
                    <img
                        :src="LogoWithMicroscope"
                        id="logoWithMicroscope"
                        alt="A microscope icon." />
                </RouterLink>
                <button
                    class="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation.">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div
                    class="collapse navbar-collapse"
                    id="navbarSupportedContent">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <RouterLink
                                class="nav-link"
                                id="scopeLink"
                                to="/scope">
                                The 'Scope
                            </RouterLink>
                        </li>
                        <li class="nav-item">
                            <a
                                href="/doc/doc/about/index.html"
                                class="nav-link"
                                >About</a
                            >
                        </li>
                        <li class="nav-item">
                            <RouterLink
                                class="nav-link"
                                id="helpLink"
                                to="/help">
                                Help
                            </RouterLink>
                        </li>
                    </ul>
                    <span class="navbar-text">
                        {{ copyright }}
                        <br />
                        Licensed Under the
                        <a href="https://opensource.org/licenses/MIT">
                            MIT License</a
                        >
                    </span>
                    <span class="navbar-text"> </span>
                </div>
            </div>
        </nav>
    </header>
</template>

<script lang="ts">
    const currentYear = new Date().getFullYear()
    const copyrightText =
        `Copyright © 2020-${currentYear}`
        + ' Regents of the University of Colorado'
    export default {
        data() {
            return {
                copyright: copyrightText,
            }
        },
        name: 'CopyAndLicense',
    }
</script>

<style>
    /*
    I used ID's instead of a class because Bootstrap's CSS wasn't being
    overridden when I used a class. ¯\_(ツ)_/¯
    */
    #scopeLink,
    #aboutLink,
    #helpLink {
        color: white;
    }
    .navbar-text a {
        text-decoration: none;
    }
    #scopeLink:hover,
    #aboutLink:hover,
    #helpLink:hover {
        text-decoration: underline;
    }
    .navbar-text a:hover {
        text-decoration: underline;
    }
    .navbar-text {
        text-align: right;
        font-size: small;
    }
    .navbar-custom {
        background-color: #809fff;
        color: white;
    }
    #logoWithMicroscope {
        width: 10em;
    }
</style>
