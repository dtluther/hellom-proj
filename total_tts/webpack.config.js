const path = require('path');
const BundleTracker = require('webpack-bundle-tracker');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
    // the base directory for resolving the entry option
    // context: __dirname,
    // the entry point that will have all of the js, don't need extension bevaues of resolve below
    entry: './assets/js/index',
    output: {
        // where we want the combiled bundle to be stored
        path: path.resolve('./assets/bundles/'),
        // apparently convention for webpack
        filename: '[name]-[hash].js',
        publicPath: '' // This fixed my issue
    },
    plugins: [
        // new CleanWebpackPlugin(),
        // this is new to me, but apparently webpack stores data bout your bundles here
        new BundleTracker({
            filename: './webpack-stats.json'
        }),
    ],
    module: {
        rules: [
            {
                // tells webpack to use the below loaders on all jsx and js files
                test: [/\.jsx?$/, /\.js?$/],
                // avoid node moduiles, this will take forever
                exclude: /node_modules/,
                loader: 'babel-loader',
                // got rid of options and presets below this in favor or a bablrc
            }
        ]
    },
    resolve: {
        // extentions that should be used to resolve modules
        extensions: ['.js', '.jsx']
    }
}