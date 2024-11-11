<template>
    <header>
        <nav>
            <div id="navbar-main">
                <a href="/doc/doc/about/">
                    <img :src="LogoWithMicroscope" alt="A microscope icon.">
                </a>
                <button
                    id="navbar-toggler"
                    type="button"
                    aria-controls="navbarSupportedContent"
                    :aria-expanded="menuOpen"
                    aria-label="Toggle navigation."
                    @click="toggleMenu">
                    <span class="material-icons-sharp">menu</span>
                </button>
            </div>
            <slot class="specimen-bar" />
            <div class="burger-menu">
                <div id="navbar-links" :class="{open: menuOpen}">
                    <RouterLink
                        class="nav-link"
                        to="/gallery"
                        @click="closeMenu">
                        Gallery
                    </RouterLink>
                    <div class="help-popper">
                        Help
                        <div id="help-popup">
                            <div class="nav-link">
                                <a :href="vizLink()">
                                    {{ specimen.visualizer.name }} Visualizer
                                </a>
                            </div>
                            <div class="nav-link">
                                <a :href="seqLink()">
                                    {{ seqWord() }} Sequence
                                </a>
                            </div>
                            <div class="nav-link">
                                <a href="/doc/">Documentation</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="close material-icons-sharp">close</div>
            </div>
        </nav>
    </header>
</template>

<script setup lang="ts">
    import {ref} from 'vue'
    import type {PropType, UnwrapNestedRefs} from 'vue'
    import {RouterLink} from 'vue-router'

    import LogoWithMicroscope from '@/assets/img/logo.svg'
    import type {Specimen} from '@/shared/Specimen'

    const props = defineProps({
        specimen: {
            type: Object as PropType<UnwrapNestedRefs<Specimen>>,
            required: true,
        },
    })

    const menuOpen = ref(false)

    function toggleMenu() {
        menuOpen.value = !menuOpen.value
    }

    function closeMenu() {
        menuOpen.value = false
    }

    function seqWord() {
        return props.specimen.sequence.name.split(/[\s:]/, 2)[0]
    }
    function seqLink() {
        return `/doc/src/sequences/${seqWord()}/`
    }
    function vizLink() {
        return `/doc/src/visualizers/${props.specimen.visualizerKey}/`
    }
</script>

<style scoped lang="scss">
    nav {
        display: flex;
        flex-direction: column;
        justify-content: center;
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

        .close {
            display: none;
            font-size: 32px;
            cursor: pointer;
        }

        .burger-menu {
            color: var(--ns-color-black);
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
            color: var(--ns-color-black);
            background-color: var(--ns-color-white);
            &.open {
                display: flex;
                z-index: 1000;
            }

            @media (min-width: $mobile-breakpoint) {
                display: flex;
            }

            .help-popper {
                font-family: var(--ns-font-display);
                font-size: var(--ns-size-display);
                background-color: var(--ns-color-white);
                position: relative;
                padding-right: 0.5em;

                #help-popup {
                    visibility: hidden;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    align-content: flex-end;
                    white-space: nowrap;
                    position: absolute;
                    right: 0;
                    width: auto;
                    z-index: 10000;
                    background-color: var(--ns-color-white);
                    opacity: 1;
                    padding-bottom: 0.5ex;
                    padding-top: 0.5ex;
                }

                &:hover #help-popup {
                    visibility: visible;
                    opacity: 1;
                }
            }

            .nav-link {
                font-family: var(--ns-font-display);
                font-size: var(--ns-size-display);
                margin-top: 8px;
                padding-left: 0.5em;
                padding-right: 0.5em;
                padding-top: 0.2ex;
                padding-bottom: 0.2ex;
                text-decoration: none;

                a {
                    font-family: var(--ns-font-display);
                    text-decoration: none;
                }

                &:focus,
                &:hover {
                    text-decoration: underline;
                }

                a:hover {
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

    @media (min-width: $tablet-breakpoint) {
        nav {
            justify-content: space-between;
            align-items: center;
            flex-direction: row;
            height: var(--ns-desktop-navbar-height);
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
                gap: 24px;
                .nav-link {
                    margin-top: 0;
                }
            }
        }
        .specimen-bar {
            display: flex;
        }
    }
</style>
