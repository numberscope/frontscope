<template>
    <footer class="text-center">
        <img src="../../assets/img/logo_no_microscope.svg" />
        <span>
            Thank you very much to
            <a href="/doc/doc/acknowledgments/index.html" class="footer-link">
                those who made Numberscope possible</a
            >
            over the years!
        </span>
        <div>
            <a class="footer-link" href="https://github.com/numberscope">
                <img src="../../assets/img/icons/github-mark-white.svg" />
            </a>
            <a class="footer-link" href="https://twitter.com/numberscoper">
                <img src="../../assets/img/icons/x_logo.svg" />
            </a>
        </div>
    </footer>
</template>

<style lang="scss">
    footer {
        background-color: var(--ns-color-primary);
        height: var(--ns-footer-height);
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-evenly;
        flex-wrap: wrap;
        padding: 8px;
        gap: 16px;

        span {
            color: var(--ns-color-white);
        }

        div {
            display: flex;
            gap: 16px;
            align-items: center;
        }
    }

    .footer-link {
        color: #eeca84;
        height: fit-content;

        img {
            height: 18px;
        }
    }
    .footer-link:hover {
        color: white;
    }
    #linkSpacer {
        padding: 0 2em;
    }
</style>
