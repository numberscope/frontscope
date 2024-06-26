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
            <slot class="specimen-bar"></slot>
            <div class="burger-menu">
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
                <div class="close material-icons-sharp">close</div>
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
        justify-content: center;
        padding: 8px 16px 8px 16px;
        border-bottom: 1px solid var(--ns-color-black);
        height: 76px;

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
        .close {
            display: none;
            font-size: 32px;
            cursor: pointer;
        }
        .burger-menu {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            &.open {
                .material-icons-sharp {
                    display: block;
                }
            }
        }
        #navbar-links {
            width: 100%;
            display: none;
            flex-direction: column;
            margin-top: 8px;
            border-bottom: 1px solid var(--ns-color-black);
            background-color: var(--ns-color-white);
            &.open {
                display: flex;
                z-index: 1000;
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
    .specimen-bar {
        display: none;
    }
    @media (min-width: 700px) {
        nav {
            justify-content: space-between;
            align-items: center;
            flex-direction: row;
            height: 76px;
            #navbar-main {
                #navbar-toggler {
                    display: none;
                }
            }

            #navbar-links {
                display: flex;
                flex-direction: row;
                margin-top: 0;
                border-bottom: none;
                width: unset;
                .nav-link {
                    margin-top: 0;
                    margin-left: 16px;
                }
            }
        }
        .specimen-bar {
            display: flex;
        }
    }
</style>
