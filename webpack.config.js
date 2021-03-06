var path = require('path');
var CommonsChunkPlugin = require('webpack').optimize.CommonsChunkPlugin;

module.exports = {
    devtool: 'source-map',
    debug: true,

    entry: {
        '@angular': [
            'rxjs',
            'reflect-metadata',
            'zone.js'
        ],
        'common': ['es6-shim']
    },

    output: {
        path: __dirname + '/dist/',
        publicPath: 'dist/',
        filename: '[name].js',
        sourceMapFilename: '[name].js.map',
        chunkFilename: '[id].chunk.js'
    },

    resolve: {
        extensions: ['','.ts','.js','.json', '.css', '.html']
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts',
                exclude: [ /node_modules/, /dist/ ]
            },
            {
                test: /\.json$/,
                loader: 'json'
            },
            {
                test: /\.(css|html)$/,
                loader: 'raw'
            },
            {
                test: /\.(png|jpg)$/,
                loader: 'url?limit=10000'
            }
        ]
    },

    ts: {
        transpileOnly: true
    },

    plugins: [
        new CommonsChunkPlugin({ names: ['@angular', 'common'], minChunks: Infinity })
    ],
    target:'electron-renderer'
};