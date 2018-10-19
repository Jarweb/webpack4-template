module.exports = {
    ident: 'postcss',
    plugins: [
        require('autoprefixer')({
            flexbox: 'no-2009',
            remove: false, // will disable cleaning outdated prefixes
            //supports: false, // will disable @supports parameters prefixing
            //add: true, // should Autoprefixer add prefixes. Default is true.
        }),
        require('cssnano')({
            preset: 'default',
        }),
    ]
};