/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
    root: true,
    extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/eslint-config-typescript/recommended',
        '@vue/eslint-config-prettier',
    ],
    env: {
        'vue/setup-compiler-macros': true,
    },
    rules: {
        'max-len': ['error', {code: 80, comments: 80}],
        'operator-linebreak': [2, 'before'],
    },
}
