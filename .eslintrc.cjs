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
    },
    rules: {
        'max-len': ['error', {code: 80, comments: 80}],
        'operator-linebreak': ['error', 'before', {'overrides': {'=': 'after'}}],
        'vue/multi-word-component-names': 'off',
    },
}
