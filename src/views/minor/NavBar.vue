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
                        <a href="/doc/">Help</a>
                        <div id="help-popup" class="shadowed">
                            <div class="nav-link">
                                <a href="/doc/doc/user_guide/">User Guide</a>
                            </div>
                            <div class="leftdented">
                                <a class="nav-link" :href="vizLink()">
                                    {{ specimen.visualizerName() }}
                                    Visualizer
                                </a>
                                <BoxJoin :height="28" :width="24" />
                            </div>
                            <div class="leftdented tweakup">
                                <a class="nav-link" :href="seqLink()">
                                    {{ seqWord() }} Sequence
                                </a>
                                <BoxCorner :height="28" :width="24" />
                            </div>
                            <div class="nav-link">
                                <a href="/doc/">Full Documentation</a>
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
    import BoxJoin from '@/components/BoxJoin.vue'
    import BoxCorner from '@/components/BoxCorner.vue'

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
        return props.specimen.sequenceName().split(/[\s:]/, 2)[0] || ''
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
            &.open {
                display: flex;
                z-index: 1000;
            }

            @media (min-width: $mobile-breakpoint) {
                display: flex;
            }

            .help-popper {
                cursor: pointer;
                font-family: var(--ns-font-display);
                font-size: var(--ns-size-display);
                position: relative;
                padding-right: 0.5em;

                a {
                    font-family: var(--ns-font-display);
                    text-decoration: none;
                }
                a:hover {
                    text-decoration: underline;
                }

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
                    margin-top: 0.3ex;
                    padding-bottom: 0.5ex;
                    padding-top: 0.5ex;
                    border: 1px solid var(--ns-color-black);

                    .leftdented {
                        display: flex;
                        align-items: center;
                    }

                    .boxing {
                        --width: 24px;

                        margin-left: 0.5ex;
                        margin-right: calc(0.5em - var(--width) / 2 + 2px);
                        width: var(--width);

                        /* looks better visually */
                        margin-bottom: -1.5px;
                    }

                    .nav-link {
                        color: var(--ns-color-black);
                        padding-top: 0ex;
                        padding-bottom: 0ex;
                        margin: 0;

                        /* for aligning with the boxing */
                        line-height: 1;
                    }

                    a {
                        font-family: var(--ns-font-main);
                        font-size: var(--ns-size-heading);
                        text-decoration: none;
                        padding-right: 0px;
                    }

                    a:hover {
                        text-decoration: underline;
                    }
                }

                &:hover #help-popup {
                    visibility: visible;
                    opacity: 1;
                }
            }

            .nav-link {
                font-family: var(--ns-font-display);
                font-size: var(--ns-size-display);
                color: var(--ns-color-black);
                margin-top: 8px;
                padding-left: 0.5em;
                padding-right: 0.5em;
                padding-top: 0.2ex;
                padding-bottom: 0.2ex;
                text-decoration: none;

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
                align-items: center;
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
