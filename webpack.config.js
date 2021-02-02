//@ts-check

'use strict';

module.exports = (env, argv) => {
    const path = require('path');
    const TerserPlugin = require('terser-webpack-plugin');
    const mode = argv.mode

    let optimization;
    let devtool;
    if (mode === "production") {
        optimization = {
            minimize: true,
            minimizer: [new TerserPlugin()],
        }
        devtool = "source-map"
    } else if (mode == "development") {
        optimization = {
            minimize: false
        }
        devtool = "eval-source-map" // source-map doesn't work because vscode doesn't actually map when you're debugging extensions
    } else {
        throw Error("Unknown webpack mode: " + process.env.NODE_ENV)
    }

    /**@type {import('webpack').Configuration}*/
    const config = {
        target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
        entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
        output: {
            // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
            path: path.resolve(__dirname, 'out'),
            filename: 'extension.js',
            libraryTarget: 'commonjs2',
            devtoolModuleFilenameTemplate: '../[resource-path]'
        },
        //@ts-ignore
        devtool: devtool,
        externals: {
            vscode: 'commonjs vscode', // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
            canvas: "commonjs vscode"
        },
        resolve: {
            // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
            extensions: ['.ts', '.js']
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'ts-loader'
                        }
                    ]
                }
            ]
        },
        optimization: optimization
    };
    return config
}
