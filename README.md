## webpack 4+ tpl, 适用于spa


## 一键配置
- webpack-bundle-analyzer
- thread-loader
- happypack
- hard-source-webpack-plugin
- autodll-webpack-plugin
- postcss


## usage
```code
$ npm install
$ npm run dev
$ npm run pre
$ npm run prod
```

## 修改配置
```code
    // ...

    useBundleAnalyzer: false,
    // happypack 于 thread-loader 不要一起用，线程争夺
    useHappyPack: true, 
    // 目前用于非生产环境
    useAutoDll: false,
    // 出现缓存错误时，要手动删除cache，用于开发环境
    useHardSource: true,
    // 目前只用于加速babel-loader，js压缩也开启了多线程
    useThreadLoader: false 
```