const path = require("path");
const fs = require('fs');
const request = require("request");
const Client = require('ftp');
const parseString = require('xml2js').parseString;
const api = require("../support");
const C = require("../codes");
const pdc = require("../../lib/dataConnection");


const API_KEY = "C9U-7S6-FV1-AQ7";

exports.resourceList = [
    {
        path: "entrypoint/get_config",
        callback: _entrypoin_get_config,
        method: "post",
        protected: false
    },{
        path: "channel/get",
        callback: _get_channel,
        method: "post",
        protected: false
    }
];

/** API Interface  ***/


function _entrypoin_get_config(req, res) {

    const db = pdc.db;

    if (db) {
        db.Channels.find({"source.entrypointId": req.body.entrypointId}, function (error, channels) {
            res.send(new api.Success(channels));
        })
    } else {
        res.status(C.error.database.DISCONNECTED.httpCode).send(new
        api.Error(C.error.database.DISCONNECTED));
    }
}

function _get_channel(req, res) {

    const db = pdc.db;

    if (db) {
        db.Channels.findeOne({"entryPoint.streamKey": req.streamKey}, function (error, channel) {
            res.send(new api.Success(channel));
        })
    } else {
        res.status(C.error.database.DISCONNECTED.httpCode).send(new
        api.Error(C.error.database.DISCONNECTED));
    }
}