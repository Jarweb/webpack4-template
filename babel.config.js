module.exports = {
    presets: [
        ['@babel/env', {
            'debug': true,
            'include': [],
            'useBuiltIns': "usage",
            "modules": false,
        }],
        // '@babel/preset-react',
    ],
    plugins: [
        "@babel/plugin-proposal-function-bind",
        "@babel/plugin-syntax-dynamic-import",
        // 顺序不能变
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-proposal-class-properties", { "loose": true }],

        // preact 设置
        // ["@babel/transform-react-jsx", { "pragma": "h" }],

        // react 优化
        // "@babel/plugin-transform-react-constant-elements",
        // "@babel/plugin-transform-react-inline-elements",
        // "transform-react-remove-prop-types",
        // "transform-node-env-inline",

        // antd-mobile 设置
        // ['import', { libraryName: 'antd-mobile', style: 'css' }]
    ]
}