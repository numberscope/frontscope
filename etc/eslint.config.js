import globals from 'globals'
import jslint from '@eslint/js'
import tslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default tslint.config(
    jslint.configs.recommended,
    ...tslint.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        files: ['**/*.vue', '**/*.js', '**/*.mjs', '**/*.ts'],
        languageOptions: {
            ecmaVersion: 'latest',
        },
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                {argsIgnorePattern: '^_'},
            ],
            '@typescript-eslint/no-empty-function': [
                'error',
                {allow: ['methods']},
            ],
            'max-len': ['error', {code: 80, comments: 80}],
            'no-irregular-whitespace': ['error', {skipComments: true}],
            'no-trailing-spaces': 'error',
            'no-undef': 'error',
            'operator-linebreak': [
                'error',
                'before',
                {overrides: {'=': 'after'}},
            ],
        },
    },
    {
        files: ['**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tslint.parser, // parse TS inside VUE
            },
        },
        rules: {
            'vue/html-closing-bracket-newline': [
                'error',
                {
                    singleline: 'never',
                    multiline: 'never',
                    selfClosingTag: {
                        singleline: 'never',
                        multiline: 'never',
                    },
                },
            ],
            'vue/html-indent': ['error', 4],
            'vue/max-attributes-per-line': [
                'error',
                {
                    singleline: {max: 25},
                    multiline: {max: 2},
                },
            ],
            'vue/multi-word-component-names': 'off',
            'vue/singleline-html-element-content-newline': 'off',
            // For the Paramable interface, v-model directives
            // need type annotation
            'vue/valid-v-model': 'off',
        },
    },
    {
        files: ['src/components/MageExchangeA.vue'],
        rules: {'max-len': 'off'},
    },
    {
        files: ['etc/vitest.config.ts'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
    {
        files: ['src/visualizers/p5.brush.d.ts'],
        rules: {'no-undef': 'off'},
    },
    {
        ignores: ['.venv/*', 'dist/*', 'e2e/results/*'],
    }
)
