<!-- eslint-disable -->
<template>
    <div class="container" id="helpContent">
        <h1>Need help?</h1>
        <nav>
            <!--
                The reason this file is ignored by Prettier and ESLint is
                because ALL I WANT TO DO (ง •̀_•́)ง is put a space between the
                icon and the link, and if I have Prettier enabled for this file,
                it creates a newline after the icon and it strips out the space.
                I don't want to fart around with CSS to do something so simple,
                so made Prettier and ESLint ignore this file. You might be
                wondering why I didn't ignore the lines instead of ignoring the
                whole file. Making Prettier ignore lines (or the whole file) by
                adding a comment doesn't work for Vue files. Truly rage
                inducing.
            -->
            <ul>
                <li>
                    <i class="bi bi-question-circle"></i> <a href="#">User Guide</a>
                </li>
                <li>
                    <i class="bi bi-file-text"></i> <a href="#">Documentation</a>
                </li>
                <li>
                    <i class="bi bi-github"></i> <a href="https://github.com/numberscope">Find Us on GitHub</a>
                </li>
                <li>
                    <i class="bi bi-envelope"></i> <a href="mailto:numberscope@colorado.edu">Shoot Us an Email</a>
                </li>
            </ul>
        </nav>
    </div>
</template>

<style>
    #helpContent {
        margin-top: 20px;
        margin-bottom: 20px;
    }
</style>
