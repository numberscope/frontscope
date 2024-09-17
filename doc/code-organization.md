# Code organization

Here's a brief overview of the directory layout of this project, to help you
find what you're looking for, and to guide you when you need to create new
files.

## Top level of project

Here you will find the obligatory README.md and licensing/contributing
information, project manifests like package.json and requirements.txt, and the
top-level index.html for vite. There are also a few hidden (dotfile)
configuration files, like git's own .git and .gitignore files, similar ones
for github and Husky, and the .env files that control environment variables.
Otherwise, we try to keep the top level uncluttered, and you should rarely
need to create a file here.

-   ### etc/ -- Configuration files

    In particular, since frontscope uses so many tools, we have moved all of
    their configuration files into etc/, as they were accumulating in the top
    level. You should be able to find almost all configuration information
    here, and any new tool that needs to be introduced should be invoked so as
    to find its configuration file in the etc directory. As one example, the
    Vite and Vitest configuration files are located here. An exception is the
    several tsconfig files for the TypeScript compiler -- we have not been
    able to find a way to get these to work except in the top-level directory
    of the project

-   ### src/ -- Source code

    All of the actual TypeScript and Vue source code for the frontscope web
    application is located here, along with assets that are used in-browser.
    Only the top-level App.vue and main.ts are directly at the top level. The
    rest are arranged in subdirectories:

    -   #### src/assets/ and src/public/

        Non-code assets needed when the site is deployed.

    -   #### src/components/ -- Vue components

    -   #### src/router/ -- Vue router

    -   #### src/sequences/ -- Sequence implementations

        These classes provide the integer sequences that can be analyzed with
        Numberscope.

    -   #### src/shared/

        Code needed by multiple other directories is located here.

    -   #### src/views/ -- Vue views selected by the router

    -   #### visualizers/ and visualizers-workbench/

        These directories contain the implementations of the various means of
        turning a sequence of numbers into a graphical presentation. In some
        sense, these are the heart of Numberscope. The workbench directory is
        for Visualizers under development (together with a template
        permanently kept there), and those in visualizers/ will automatically
        appear in the user interface

-   ### doc/ -- Documentation

    This directory contains the bulk of the content for the integrated
    documentation site. Some content is also extracted from the source code
    and incorporated when the doc site is built. The styling information for
    the site is in etc/doc_theme.

-   ### e2e/ -- End-to-end in-browser testing

    All files relating to end-to-end testing are located here. Configuration
    files are directly in this folder (another minor exception to the rule
    mentioned above that all configuration is in etc/).

    -   #### e2e/tests/ -- End-to-end test specifications
    -   #### e2e/results/ -- Files generated via testing.

-   ### tools/ -- Internal utilities

    Contains code for any custom utilities used for example in the building
    and maintenance of frontscope. Nothing here should actually be needed by
    the eventual web application.
