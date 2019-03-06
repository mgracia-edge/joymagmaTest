const fs = require('fs');
const path = require('path');
const MinifyPlugin = require("babel-minify-webpack-plugin");

function getJSFiles(root, folderPath) {
    let module = [],
        controller = [],
        service = [],
        low = [];

    let files = fs.readdirSync(folderPath);

    for (let file of files) {

        if (file.endsWith(".js")) {

            let a;
            if (file.startsWith("module_")) {
                a = module;
            } else if (file.startsWith("service_")) {
                a = service;
            } else if (file.startsWith("controller_")) {
                a = controller;
            } else {
                a = low;
            }

            a.push(path.join(folderPath, file))

        }
    }

    return module.concat(service, controller, low);

}

const config = {
    entry: getJSFiles("", path.join(__dirname, './public/javascript/')),
    mode: 'production',
    optimization: {
        minimize: false
    },
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, './public')
    },
    plugins: [
        new MinifyPlugin({
            mangle: false
        }, {}),
    ],
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: "babel-loader",
                options: {
                    presets: ["@babel/preset-env"]
                }
            }
        }]
    }
};

module.exports = config;

