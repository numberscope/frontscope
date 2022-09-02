# Numberscope onboarding

## Accounts, etc.

1. If you don't have an account, sign up for [GitHub](https://github.com).
2. Make sure you've been added to the Numberscope GitHub organization.
3. Make sure you've been added to the chat app (Slack or Zulip).

## Setting up your computer for development

1. If you don't have one, install a good text editor. Use whatever you want!
   [Visual Studio Code](https://code.visualstudio.com/) is popular, and it
   works well with our code base. If you want to use Visual Studio Code,
   install the following extensions:

    - [ ] Code Spell Checker
    - [ ] TypeScript Vue Plugin (Volar)
    - [ ] Vue Language Features (Volar)

    For more info on extensions, see:
    https://code.visualstudio.com/docs/editor/extension-marketplace.

2. If you don't have [Git](https://git-scm.com/) installed, install it. We use
   Git to keep track of the different versions of our code.
3. If you don't have [NodeJS](https://nodejs.org/en/) installed, install it.
   NodeJS allows you to run JavaScript outside of a web browser. We use it in
   our front end code base.
4. If you don't have [Python 3](https://www.python.org/) installed, install
   it.
5. Make sure you have a `venv` module by running the following command:
    ```sh
    % python3 -m venv -h
    ```
    You should see help for the `venv` module. If you don't you might have to
    install the module separately. How you do this depends on your system and
    might require some googling.
6. Somewhere on your computer, make a directory where you can keep Numberscope
   code. I like to put a directory called `Code` in my home directory. My home
   directory looks like this:
    ```
    ├── Applications
    ├── Books
    ├── Code
    ├── Desktop
    ├── Documents
    ├── Downloads
    ├── Library
    ├── Movies
    ├── Music
    ├── Pictures
    └── Public
    ```
    My `Code` directory looks like this:
    ```
    ├── my-code
    └── numberscope-code
    ```
7. Within your `numberscope-code` directory (or whatever you want to name it)
   clone the `frontscope` repository:
    ```sh
    % cd /path/to/your/numberscope/directory/
    % git clone https://github.com/numberscope/frontscope.git
    ```
    If you have trouble, read
    [this doc](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository).
    or ping someone for help.
8. Create a dotenv file (a configuration file) with the URL for the back end:
    ```sh
    % echo "VITE_API_URL={url-goes-here}" > .env.local
    ```
9. Go to the newly cloned `frontscope` directory and install the dependencies:
    ```sh
    % cd frontscope
    % npm install
    ```
    You need NodeJS installed to do this. This should install Git hooks using
    [Husky](https://github.com/typicode/husky), but if it doesn't, run
    `npm prepare`.
10. Run the development server:
    ```sh
    % npm run dev
    ```
    If this works, then congrats, you've got a working copy of the
    `frontscope` repository on your computer!

See
[this doc](https://github.com/numberscope/frontscope/blob/main/doc/running-from-source.md)
for more information.
