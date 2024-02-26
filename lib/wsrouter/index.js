const bodyParser = require('body-parser');
const engine = require("./lib/engine.js");

let mHeadersName = [];
let mHeadersContent = [];

/**
 * Bind the API to a express Object
 *
 * @param app Express JS App
 * @param config configuration object
 *
 * See README.md for more information
 *
 */

exports.register = function (app, config) {

    engine.attach(app, config, "api");

    app.use("/api/*", bodyParser.json({limit: "1024mb"}));

    if (config) {
        engine.addResource(config.resourcesDirectory, config.version);

        if (config.headers) {
            for (let i in config.headers) {
                if (config.headers.hasOwnProperty(i)) {
                    mHeadersName.push(i);
                    mHeadersContent.push(config.headers[i]);
                }
            }

            app.use("/api/*", function (req, res, next) {
                for (let i = 0; i < mHeadersName; i++) {
                    res.header(mHeadersName[i], mHeadersContent[i]);
                }
                next();
            });

            app.options("/api/*", function (req, res) {
                for (let i = 0; i < mHeadersName; i++) {
                    res.header(mHeadersName[i], mHeadersContent[i]);
                }
                res.send("");
            });

        }
    }

};

