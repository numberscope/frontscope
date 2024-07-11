/* eslint-env node */
module.exports = {
    root: true,
    extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/eslint-config-typescript/recommended',
    ],
    env: {
        'vue/setup-compiler-macros': true,
        node: true,
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
        'operator-linebreak': [
            'error',
            'before',
            {overrides: {'=': 'after'}},
        ],
        'vue/multi-word-component-names': 'off',
        // For the Paramable interface, v-model directives need type annotation
        'vue/valid-v-model': 'off',
    },
    overrides: [
        {
            files: ['src/components/MageExchangeA.vue'],
            rules: {'max-len': 'off'},
        },
    ],
}
