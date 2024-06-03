const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/socketrtc.js',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'socketrtc.js',
        clean: true,
        library: 'SocketRTC', // name of the library
        libraryTarget: 'umd' // module type
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                },
                
            },
        ],
    },
    resolve: {
        fallback: {
            "wrtc": false,
        },
        alias: {
            "socket.io": false
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        })
    ]
}