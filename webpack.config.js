let path = require('path');

let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: path.resolve(__dirname, 'src', 'index.js'),
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].bundle.js'
    },
    resolve: {
        modules: [
            path.resolve(__dirname, 'src'),
            'node_modules'
        ],
        alias: {
            vue$: 'vue/dist/vue.common'
        }
    },
    devServer: {
        hot: true
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [ 'style-loader', 'css-loader', 'sass-loader' ]
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                use: [ { loader: 'file-loader', options: { name: '[name].[ext]' } } ]
            },
            {
                test: /app\/.+\.html$/,
                use: [ 'html-loader' ]
            }
        ]
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            options: {
                sassLoader: {
                    includePaths: [ 'src' ]
                }
            }
        }),
        new HtmlWebpackPlugin({
            title: 'Chaos Snake',
            template: 'src/index.html'
        }),
        new webpack.HotModuleReplacementPlugin()
    ]
}