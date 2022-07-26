<template>
    <footer class="text-center">
        <p>
            Thank you very much to
            <a href="/doc/doc/acknowledgments/index.html" class="footer-link">
                those who made Numberscope possible</a
            >
            over the years!
        </p>
        <p>
            <i class="bi bi-github"></i>&nbsp;
            <a class="footer-link" href="https://github.com/numberscope"
                >GitHub</a
            >
            <span id="linkSpacer"></span>
            <i class="bi bi-twitter"></i>&nbsp;
            <a class="footer-link" href="https://twitter.com/numberscoper"
                >Twitter</a
            >
        </p>
    </footer>
</template>

<style>
    footer {
        background-color: var(--ns-dark-blue);
        color: white;
        padding-top: 10px;
        position: fixed;
        bottom: 0;
        width: 100%;
    }
    footer p {
        margin-bottom: 0.5rem;
    }
    .footer-link {
        color: orange;
    }
    .footer-link:hover {
        color: white;
    }
    #linkSpacer {
        padding: 0 2em;
    }
</style>
