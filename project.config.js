const path = require('path')

module.exports =  {
    devServer: {
        proxy: {
            '/api/*': {
                target: 'https://m.baidu.com',
                changeOrigin: true,
                secure: false
            }
        },
        host: "0.0.0.0",
        port: 8000,
    },

    fetchHost: {
        api_docker: 'https://m.baidu.com',
        api_pre: 'https://m.baidu.com',
        api_prod: 'https://m.baidu.com',
    },

    webpackPublicPath: {
        dev: '/',
        cdnpre: '//www.baidu.com/static/xxx/',
        cdnprod: '//www.baidu.com/static/xxx/',
        serverprod: '/'
    },

    htmlHeadOptions: {
        title: 'webpack4+',
        description: 'webpack4+',
        keyword: 'webpack',
        dnsprefetch: [
            '//cdnimg.baidu.com/',
            '//cdn.baidu.com/',
            // ...
        ],
        preconnect: [
            '//cdnimg.baidu.com/',
            '//cdn.baidu.com/',
            // ...
        ]
    },

    alias: {
        '@': path.resolve(__dirname, './src'),
        '@a': path.resolve(__dirname, './src/assets'),
        '@c': path.resolve(__dirname, './src/components'),
        '@u': path.resolve(__dirname, './src/utils'),

        // ...
    },  

    entry: {
        'index': './src/index.js',
        // 'vendor': [
            // 'preact',
            // 'preact-router',
            // 'reqwest',
        // ],
    },

    babelOptions: {
        presets: [
            ['env', {
                'targets': {
                    'browsers': [
                        // babel 7 可以直接写在package.json里
                        // 顺序不一样，结果不一样 cover 93.31%
                        // http://browserl.ist/?q=
                        'last 4 versions',
                        '> 0.2%',
                        'Firefox ESR',
                        'iOS >= 8',
                        'Android >= 4.1',
                        'not ie <= 8'
                    ]
                },
                'debug': false,
                'include': [],
                'useBuiltIns': true,
                "modules": false,
            }],
            'stage-0',
            // 'react', 
        ],
        plugins: [
            'transform-runtime', 
            "transform-decorators-legacy",

            // preact 设置
            ["transform-react-jsx", { "pragma":"h" }],

            // react 优化
            // "transform-react-constant-elements",  
            // "transform-react-inline-elements",
            // "transform-node-env-inline",

            // antd-mobile 设置
            // ['import', { libraryName: 'antd-mobile', style: 'css' }]
        ]
    },

    useBundleAnalyzer: false,
    // happypack 于 thread-loader 不要一起用，线程争夺
    useHappyPack: true, 
    // 目前用于非生产环境
    useAutoDll: true,
    // 出现缓存错误时，要手动删除cache
    useHardSource: true,
    // 目前只用于加速babel-loader，js压缩也开启了多线程
    useThreadLoader: false 
}
