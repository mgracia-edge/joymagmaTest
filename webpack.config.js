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
    mode: 'production',
    optimization:{
        minimize: false
    },
    entry: getJSFiles("", path.join(__dirname, './public/javascript/')),
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, './public')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    plugins: [
        new MinifyPlugin({}, {})
    ]
};

module.exports = config;

