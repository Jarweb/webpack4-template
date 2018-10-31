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

    // happypack 于 thread-loader 不要一起用，线程争夺
    useHappyPack: true, 
    // 目前用于非生产环境
    useAutoDll: false,
    // 出现缓存错误时，要手动删除cache，用于开发环境
    useHardSource: true,
    // 目前只用于加速babel-loader，js压缩也开启了多线程
    useThreadLoader: false 
}
