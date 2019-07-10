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
    }, {
        path: "packager/get",
        callback: packager_get,
        method: "post",
        protected: true
    }, {
        path: "test/mediainfo",
        callback: test_mediainfo,
        method: "post",
        protected: true
    }, {
        path: "kill/pid",
        callback: kill_pid,
        method: "post",
        protected: true
    }
];


function config_get(req, res) {
    request.get(ROOT + "config/get", function (error, query, response) {
        try {
            res.send(JSON.parse(response));
        } catch (e) {
            res.send({});
        }
    })
}

function entrypoint_get(req, res) {
    request.get(ROOT + `entrypoint/get/${req.body.ip}`, function (error, query, response) {
        try {
            res.send(JSON.parse(response))
        } catch (e) {
            res.send({})

        }
    })
}

function transcoder_get(req, res) {
    request.get(ROOT + `transcoder/get/${req.body.ip}`, function (error, query, response) {
        try {
            res.send(JSON.parse(response))
        } catch (e) {
            res.send({})

        }
    })
}

function packager_get(req, res) {
    request.get(ROOT + `packager/get/${req.body.ip}`, function (error, query, response) {
        try {
            res.send(JSON.parse(response))
        } catch (e) {
            res.send({})

        }
    })
}

function test_mediainfo(req, res) {
    request.post(ROOT + `mediainfo`, {
        json: req.body
    }, function (error, query, response) {
        res.send({text: response})
    })
}

function kill_pid(req, res) {
    request.get(ROOT + `${req.body.role}/${req.body.ip}/kill/${req.body.pid}`, function (error, query, response) {
        try {
            res.send(JSON.parse(response))
        } catch (e) {
            res.send({})

        }
    })
}