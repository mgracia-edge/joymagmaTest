const fs = require('fs');

let app = null;
let root = null;
let config = null;

exports.attach = function (app_, config_, root_) {
    app = app_;
    root = root_;
    config = config_;
};

exports.addResource = function (a, b, c) {

    let controller, prefix, version;

    if (typeof a === "string") {

        let files = fs.readdirSync(a);

        for (let i in files) {
            if (files.hasOwnProperty(i)) {
                let file = files[i].split(".")[0];
                let ext = files[i].split(".")[1];
                if (ext === "js") {

                    controller = require(a + "/" + files[i]);
                    prefix = file;
                    version = b;

                    for (let i in controller.resourceList) {
                        if (controller.resourceList.hasOwnProperty(i)) {
                            registerRoutes(app, version, prefix, controller.resourceList[i]);
                        }
                    }

                }
            }
        }
    } else {

        controller = a;
        prefix = b;
        version = c;

        for (let i in controller.resourceList) {
            if (controller.resourceList.hasOwnProperty(i)) {
                registerRoutes(app, version, prefix, controller.resourceList[i]);
            }
        }

    }
};

function registerRoutes(app, version, prefix, resource) {

    if (typeof resource.protected === "undefined") {
        resource.protected = true;
    }

    let url;

    if (resource.path[0] === "/") {
        url = resource.path;
    } else {
        url = "/" + root + "/" + version + "/" + prefix + "/" + resource.path;
    }

    if (resource.protected && config.authenticationFunction) {
        app.use(url, config.authenticationFunction);
    }

    if (typeof resource.bodyParser === "function") {
        app.use(url, resource.bodyParser);
    }

    switch (resource.method) {
        case "post": {
            app.post(url, resource.callback);
            console.log("route added", url);
            break;
        }
        case "get": {
            app.get(url, resource.callback);
            console.log("route added", url);
            break;
        }
        case "all": {
            app.all(url, resource.callback);
            console.log("route added", url);
            break;
        }
        default: {
            console.error("cannot add route: ", url);
            break;
        }
    }
}
