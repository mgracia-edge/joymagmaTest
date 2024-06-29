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
        callback: _entrypoint_get_config,
        method: "post",
        protected: false
    },{
        path: "entrypoint/post_status",
        callback: _entrypoint_post_status,
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

async function _entrypoint_get_config(req, res) {
    const db = pdc.db;

    if (!db) {
        return res.status(C.error.database.DISCONNECTED.httpCode).send(new
            api.Error(C.error.database.DISCONNECTED));
    }

    try {
        const channels = await db.Channels.find({"source.entrypointId": req.body.entrypointId})

        return res.status(200).send(new api.Success(channels));
    } catch (error) {
        console.error(`Error in ext/services.js -- _entrypoint_get_config service: ${error.message}`)        
        res.status(500).send(new api.Error("Error"))
    }
}

async function _get_channel(req, res) {
    const db = pdc.db;

    if (!db) {
        return res.status(C.error.database.DISCONNECTED.httpCode).send(new
        api.Error(C.error.database.DISCONNECTED));
    }
        
    try {
        const channel = await db.Channels.findOne({"entryPoint.streamKey": req.body.streamKey})

        return res.send(new api.Success(channel));
    } catch (error) {
        console.error(`Error in ext/services.js -- _get_channel service: ${error.message}`)        
        res.status(500).send(new api.Error("Error"))
    }
}

async function _entrypoint_post_status(req, res) {
    const db = pdc.db;

    if (!db) {
        return res.status(C.error.database.DISCONNECTED.httpCode).send(new
        api.Error(C.error.database.DISCONNECTED));
    }

    try {
        const channel = await db.Channels.update({"_id": req.body.channelId,})
        
        res.send(new api.Success(channel));
    } catch (error) {
        console.error(`Error in ext/services.js -- _entrypoint_post_status service: ${error.message}`)        
        res.status(500).send(new api.Error("Error"))   
    }
}