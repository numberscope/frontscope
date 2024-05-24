<script setup lang="ts">
    import {RouterLink} from 'vue-router'
    import LogoWithMicroscope from '../../assets/img/logo.svg'
</script>

<template>
    <header>
        <nav>
            <div id="navbar-main">
                <RouterLink id="logo" to="/" v-on:click="closeMenu">
                    <img :src="LogoWithMicroscope" alt="A microscope icon." />
                </RouterLink>
                <button
                    id="navbar-toggler"
                    type="button"
                    aria-controls="navbarSupportedContent"
                    :aria-expanded="menuOpen"
                    aria-label="Toggle navigation."
                    v-on:click="toggleMenu">
                    <span class="material-icons-sharp">menu</span>
                </button>
            </div>
            <div id="navbar-links" :class="{open: menuOpen}">
                <RouterLink
                    class="nav-link"
                    to="/gallery"
                    v-on:click="closeMenu">
                    Gallery
                </RouterLink>

                <a href="/doc/doc/about/index.html" class="nav-link">
                    About
                </a>

                <a href="/doc/" class="nav-link"> Documentation </a>
            </div>
        </nav>
    </header>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'

    export default defineComponent({
        name: 'NavBar',
        data: function () {
            return {
                menuOpen: false,
            }
        },
        methods: {
            toggleMenu: function () {
                this.menuOpen = !this.menuOpen
            },

            closeMenu: function () {
                this.menuOpen = false
            },
        },
    })
</script>

<style lang="scss" scoped>
    nav {
        display: flex;
        flex-direction: column;
        padding: 8px 16px 8px 16px;
        border-bottom: 1px solid var(--ns-color-black);

        #navbar-main {
            display: flex;
            flex-direction: row;
            justify-content: space-between;

            #navbar-toggler {
                background: none;
                border: none;
                display: flex;
                justify-content: center;
                align-items: center;
            }
        }

        #navbar-links {
            display: none;
            flex-direction: column;
            margin-top: 8px;

            &.open {
                display: flex;
            }

            @media (min-width: var(--ns-breakpoint-mobile)) {
                display: flex;
            }

            .nav-link {
                font-family: var(--ns-font-display);
                font-size: var(--ns-size-display);

                margin-top: 8px;
                text-decoration: none;

                &:focus,
                &:hover {
                    text-decoration: underline;
                }
            }
        }
    }
    #logo {
        img {
            height: 32px;
        }
    }

    @media (min-width: 900px) {
        nav {
            justify-content: space-between;
            align-items: center;
            flex-direction: row;
            #navbar-main {
                #navbar-toggler {
                    display: none;
                }
            }

            #navbar-links {
                display: flex;
                flex-direction: row;
                margin-top: 0;

                .nav-link {
                    margin-top: 0;
                    margin-left: 16px;
                }
            }
        }
    }
</style>
