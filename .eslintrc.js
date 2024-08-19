module.exports = {
    root: true,
    env: {
        node: true
    },
    'extends': [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/typescript/recommended'
    ],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        // 基础规则
        '@typescript-eslint/no-explicit-any': 'off',           // 忽略使用 any 类型的错误
        'no-debugger': 'warn',                                 // debugger
        'no-console': 'warn',                                  // console
        'prefer-arrow-callback': 'warn',                       // 优先使用箭头函数
        'quotes': ['warn', 'single'],                          // 引号
        // Vue 相关规则
        'vue/html-closing-bracket-spacing': ['warn', {
            'startTag': 'never',
            'endTag': 'never',
            'selfClosingTag': 'always'
        }],                                                  // html 标签闭合
        'vue/html-quotes': [ 'warn',
            'double', 
            { 'avoidEscape': true }
        ],                                                  // html 引号
        'vue/v-for-delimiter-style': ['error', 'in'],         // v-for 分隔符
        'vue/require-name-property': 'warn',                  // 组件 name 属性
        'vue/prefer-true-attribute-shorthand': 'warn',        // 属性简写
    }
}
