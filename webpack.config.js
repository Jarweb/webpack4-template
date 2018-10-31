const path = require('path')
const webpack = require('webpack')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")

const CleanWebpackPlugin = require('clean-webpack-plugin')
const InlineSourcePlugin = require('html-webpack-inline-source-plugin')
const ImageminPlugin = require('imagemin-webpack-plugin').default
const ManifestPlugin = require('webpack-manifest-plugin')

const os = require('os')
const HappyPack = require('happypack')
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })

const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
const AutoDllPlugin = require('autodll-webpack-plugin')

const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
// const SizePlugin = require('size-plugin')
// const CompressionPlugin = require('compression-webpack-plugin')

const config = require('./project.config.js')
const isProd = (process.env.NODE_ENV === 'production')


// 环境
console.log(process.env.NODE_ENV)
// 环境附带参数
console.log(process.env.PARAMS_SETTING)
console.log('pubpath', getPubPath(process.env.NODE_ENV))


const styleBaseLoaderOpts = {
    'less': [
        'css-loader?&importLoaders=3&sourceMap',
        'postcss-loader',
        'resolve-url-loader',
        'less-loader',
    ],
    'mless': [
        'css-loader?modules&importLoaders=3&sourceMap&localIdentName=[local]_[hash:base64:5]',
        'postcss-loader',
        'resolve-url-loader',
        'less-loader',
    ],
    'stylus': [
        'css-loader?&importLoaders=3&sourceMap',
        'postcss-loader',
        'resolve-url-loader',
        'stylus-loader',
    ],
    'mstylus': [
        'css-loader?modules&importLoaders=3&sourceMap&localIdentName=[local]_[hash:base64:5]',
        'postcss-loader',
        'resolve-url-loader',
        'stylus-loader',
    ],
    'css': [
        'css-loader?&importLoaders=3&sourceMap',
        'postcss-loader',
        'resolve-url-loader',
    ],
    'mcss': [
        'css-loader?&importLoaders=3&sourceMap',
        'postcss-loader',
        'resolve-url-loader',
    ]
}

const basePlugins = [
    new CleanWebpackPlugin(['dist']),
    new webpack.NamedModulesPlugin(),

    new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        },
        '_ENV_': JSON.stringify(process.env.NODE_ENV),
        '_ENV_PARAMS_': JSON.stringify(process.env.ENV_PARAMS)
    }),

    // 暂不支持hmr
    new MiniCssExtractPlugin({
        filename: !isProd ? '[name].css' : 'assets/css/app.[contenthash].css',
        chunkFilename: !isProd ? '[id].css' : 'assets/css/[id].[contenthash].css', 
    }),
    
    new HtmlWebpackPlugin({
        path: 'dist',
        inject: true,
        minify: isProd ? {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
        } : {},
        filename: 'index.html',
        template: './src/index.ejs',
        title: config.htmlHeadOptions.title || '',
        htmlHeadPreLink: {
            dnsprefetch: [...config.htmlHeadOptions.dnsprefetch],
            preconnect: [...config.htmlHeadOptions.preconnect],
        },
        htmlHeadMeta: {
            desc: config.htmlHeadOptions.description || '',
            keyword: config.htmlHeadOptions.keyword || '',
        },
        inlineSource: 'runtime.+\\.js', // runtime inline
    }),
    // 结合上面 inlinesource
    new InlineSourcePlugin(),
    new FriendlyErrorsWebpackPlugin(),
    // new SizePlugin(),
    // new CompressionPlugin()
]

const webpackOpts = {
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? '' : 'source-map', // in prod hidden-source-map if u want
    context: __dirname,

    watchOptions: {
        ignored: /node_modules/,
        aggregateTimeout: 300,
        poll: 2000
    },

    devServer: {
        ...config.devServer,
        historyApiFallback: true,
        compress: true,
        quiet: false,
        contentBase: path.join(__dirname, 'dist'),
    },

    resolve: {
        alias: {...config.alias},
        extensions: [
            '.web.js', 
            '.js', 
            '.json', 
            '.css', 
            '.less', 
            '.scss', 
            '.styl', 
            '.jsx'
        ],
        modules: [
            "node_modules",
            path.resolve(__dirname, "src")
        ],
    },

    entry: config.entry,
    output: {
        pathinfo: false,
        path: path.resolve(__dirname, 'dist'),
        filename: isProd 
            ? 'assets/js/[name].[hash:8].js' 
            : 'assets/js/[name].js',
        chunkFilename: isProd 
            ? 'assets/js/[name].[chunkhash:8].chunk.js' 
            : 'assets/js/[name].chunk.js',
        publicPath: getPubPath(process.env.NODE_ENV)
    },

    module: {
        rules: [
            {
                test: /\.js|jsx$/,
                include: [
                    path.resolve(__dirname, "src")
                ],
                exclude: [
                    /node_modules/,
                    path.resolve(__dirname, "src/vendor")
                ],
                use: [
                    config.useThreadLoader
                        ? {
                            loader: 'thread-loader',
                            options: {
                                workers: os.cpus().length - 1,
                            },
                        }
                        : null,
                    config.useHappyPack 
                        ? genHappypack('js')
                        : {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                        }
                    }
                ].filter((item) => item !== null)
            },
            {
                test: /\.less$/i,
                exclude: /\.m\.less$/,
                use: [
                    !isProd ? 'style-loader' : MiniCssExtractPlugin.loader,
                ].concat(config.useHappyPack
                    ? [genHappypack('less')]
                    : styleBaseLoaderOpts['less'])
            },
            {
                test: /\.m\.less$/i,
                use: [
                    !isProd ? 'style-loader' : MiniCssExtractPlugin.loader,
                ].concat(config.useHappyPack
                    ? [genHappypack('mless')]
                    : styleBaseLoaderOpts['mless'])
            },
            {
                test: /\.styl$/i,
                exclude: /\.m\.styl$/,
                use: [
                    !isProd ? 'style-loader' : MiniCssExtractPlugin.loader,
                ].concat(config.useHappyPack
                    ? [genHappypack('stylus')]
                    : styleBaseLoaderOpts['stylus'])
            },
            {
                test: /\.m\.styl$/i,
                use: [
                    !isProd ? 'style-loader' : MiniCssExtractPlugin.loader,
                ].concat(config.useHappyPack
                    ? [genHappypack('mstylus')]
                    : styleBaseLoaderOpts['mstylus'])
            },
            {
                test: /\.css$/i,
                exclude: /\.m\.css$/,
                use: [
                    !isProd ? 'style-loader' : MiniCssExtractPlugin.loader,
                ].concat(config.useHappyPack
                    ? [genHappypack('css')]
                    : styleBaseLoaderOpts['css'])
            },
            {
                test: /\.m\.css$/i,
                use: [
                    !isProd ? 'style-loader' : MiniCssExtractPlugin.loader,
                ].concat(config.useHappyPack
                    ? [genHappypack('mcss')]
                    : styleBaseLoaderOpts['mcss'])
            },
            {
                test: /\.(jpg|jpeg|png|gif|svg)$/i,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'assets/img/[name].[hash:8].[ext]',
                }
            },
            {
                test: /\.svg$/i,
                loader: 'svg-inline-loader',
                options: {
                    limit: 10000,
                    name: 'assets/img/[name].[hash:8].[ext]',
                }
            },
            {
                test: /\.(svga)$/i,
                loader: 'file-loader',
                options: {
                    name: 'assets/svga/[name].[hash:8].[ext]',
                }
            },
            {
                test: /\.(mp3)$/i,
                loader: 'file-loader',
                options: {
                    name: 'assets/audio/[name].[hash:8].[ext]',
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'assets/font/[name].[hash:8].[ext]',
                }
            },
            {
                test: /\.html$/i,
                use: 'html-loader'
            },
        ],
    },

    optimization: {
        runtimeChunk: {
            name: 'runtime'
        },
        // removeAvailableModules: true, // always
        // removeEmptyChunks: true, // always
        // mergeDuplicateChunks: true, // always
        // namedModules: true, // dev auto
        // noEmitOnErrors: false, // prod auto

        // providedExports: true, // always
        // sideEffects: true, // prod auto
        // usedExports: true, // mode pro auto

		// concatenateModules: true, // mode pro auto
        // occurrenceOrder: true, // mode pro auto
        // flagIncludedChunks: true, // prod auto
        splitChunks: {
            chunks: 'async',
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            name: false,

			cacheGroups: {
                vendor: {
                    // 初次加载需要
                    chunks: "initial",
                    test: /node_modules/,
                    name: "vendor",
                    reuseExistingChunk: true,
                    maxInitialRequests: 5,
                    // priority: 20,
                    // minChunks: 1,
					// enforce: true
                },
				vendor1: {
                    // 抽取vendor中的共用部分，及vendor中不声明部分
					chunks: 'initial',
					test: /node_modules/,
                    name: 'vendor-2',
                    priority: 10,
                    minChunks: 2,
                    reuseExistingChunk: true,
                    maxInitialRequests: 5,
					enforce: true
                },
                // common1: {
                //     test: /node_modules/,
                //     name: 'vendor-async',
                //     // priority: 10,
                //     // 抽取vendor-1 vendor-2 异步加载的相同部分
                //     chunks: 'async',
                //     reuseExistingChunk: true,
                //     minChunks: 2,
                //     enforce: true,
                // },
                // common2: {
                //     test: /src/,
                //     name: 'app-common',
                //     // priority: 10,
                //     // 抽取业务入口文件的相同部分，如果业务大的话需要
                //     chunks: 'initial',
                //     reuseExistingChunk: true,
                //     minChunks: 2,
                //     enforce: true,
                // },
                common: {
                    // 抽取业务异步的相同部分
                    name: 'app-async',
                    test: /src/,
                    // priority: 10,
                    chunks: 'async',
                    reuseExistingChunk: true,
                    minChunks: 2,
                    enforce: true,
                },

                styles: {
                    name: 'styles',
                    test: /\.less|css$/,
                    chunks: 'all',
                    enforce: true
                }
			}
        },
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: true
            }),
            new OptimizeCSSAssetsPlugin()
        ]
    },


    plugins: basePlugins
}

if(isProd) {
    basePlugins.push(
        new webpack.HashedModuleIdsPlugin(),
        // new webpack.optimize.OccurrenceOrderPlugin(), // webpack 4+ prod auto
        // new webpack.optimize.ModuleConcatenationPlugin(), // webpack 4+ prod auto

        // 提取manifest.json runtime里变化的部分一般是这个部分 
        new ManifestPlugin(),
        new ImageminPlugin({
            pngquant: {
              quality: '80-100'
            }
        })
    )
}

// npm run dev --analyze
if (process.env.npm_config_analyze) {
    basePlugins.push(new BundleAnalyzerPlugin())
}

if (process.env.NODE_ENV === 'development' && config.useHardSource) {
    basePlugins.push(
        new HardSourceWebpackPlugin({
            cacheDirectory: 'node_modules/.cache/hard-source/[confighash]',
            recordsPath: 'node_modules/.cache/hard-source/[confighash]/records.json',
            configHash: function (webpackConfig) {
                return require('node-object-hash')({ sort: false }).hash(webpackConfig);
            },
            environmentHash: {
                root: process.cwd(),
                directories: [],
                files: ['package-lock.json'],
            },
            cachePrune: {
                // Caches younger than `maxAge` are not considered for deletion. They must
                // be at least this (default: 2 days) old in milliseconds.
                maxAge: 1 * 24 * 60 * 60 * 1000,
                // All caches together must be larger than `sizeThreshold` before any
                // caches will be deleted. Together they must be at least this
                // (default: 50 MB) big in bytes.
                sizeThreshold: 50 * 1024 * 1024
            },
        })
    )
}

if(config.useAutoDll) {
    basePlugins.push(
        new AutoDllPlugin({
            context: path.join(__dirname, '../'),
            inject: true,
            filename: '[name].dll.js',
            entry: config.entry.vendor
        })
    )
}

function genHappypack(ext) {
    if(ext === 'js') {
        basePlugins.push(
            new HappyPack({
                id: 'js',
                threadPool: happyThreadPool,
                use: [
                    // 有时候刷新有缓存？
                    // 'cache-loader',
                    {
                        loader: 'babel-loader',
                        query: { ...config.babelOptions }
                    }
                ]
            })
        )

        return 'happypack/loader?id=js'
    }

    basePlugins.push(
        new HappyPack({
            id: ext,
            threadPool: happyThreadPool,
            use: styleBaseLoaderOpts[ext]
        })
    )

    return `happypack/loader?id=${ext}`
}


function getPubPath (env) {
    switch (env) {
        case 'production':
            return config.webpackPublicPath.cdnprod
        case 'cdnpre':
            return config.webpackPublicPath.cdnpre
        case 'serverprod':
            return config.webpackPublicPath.serverprod
        case 'dev':
            return config.webpackPublicPath.dev
        default:
            return '/' 
    }
}

function resolvePath(_path) {
    return path.resolve(__dirname, _path)
}

module.exports = webpackOpts