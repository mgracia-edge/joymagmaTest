const request = require("request");

const ROOT = "http://200.2.125.60:10888/api/";

exports.resourceList = [
    {
        path: "config/get",
        callback: config_get,
        method: "post",
        protected: true
    }, {
        path: "entrypoint/get",
        callback: entrypoint_get,
        method: "post",
        protected: true
    }, {
        path: "transcoder/get",
        callback: transcoder_get,
        method: "post",
        protected: true
    }
];


function config_get(req, res) {
    request.get(ROOT + "config/get", function (error, query, response) {
        res.send(JSON.parse(response))
    })
}

function entrypoint_get(req, res) {
    request.get(ROOT + `entrypoint/get/${req.body.ip}`, function (error, query, response) {
        res.send(JSON.parse(response))
    })
}

function transcoder_get(req, res) {
    request.get(ROOT + `transcoder/get/${req.body.ip}`, function (error, query, response) {
        res.send(JSON.parse(response))
    })
}