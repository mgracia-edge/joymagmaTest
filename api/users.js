const pdc = require("../lib/provisoryDataConnection");
const {join} = require("path");

exports.resourceList = [
    {
        path: "login",
        callback: login,
        method: "post",
        protected: false
    }
];

function login(req, res) {

    res.status(200).send({});

}
