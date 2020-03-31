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
        path: "create",
        callback: _create,
        method: "post",
        protected: false
    },
    {
        path: "read",
        callback: _read,
        method: "post",
        protected: false
    },
    {
        path: "update",
        callback: _update,
        method: "post",
        protected: false
    },
    {
        path: "delete",
        callback: _delete,
        method: "post",
        protected: false
    },
    {
        path: "channel/restart",
        callback: _channel_restart,
        method: "post",
        protected: false
    }

];

/** API Interface  ***/


function _create(req, res) {
    const {cid, email, password, name, products} = req.body;

    if (cid && email && password && name && products) {

        let db = pdc.db;

        if (db) {

            const CURRENT_DATE = new Date();

            db.Subscriber.create({
                cid: cid,
                email: email,
                password: password,
                name: name,
                products: products,
                creationDate: CURRENT_DATE,
                lastUpdate: CURRENT_DATE,
                updateHistory: [],
                favoriteChannels: []
            }, function (error, data) {

                if (!error) {
                    res.send(new api.Success({}))
                } else {
                    if (error.code === 11000) {
                        res.status(C.error.database.DUPLICATED.httpCode).send(new
                        api.Error(C.error.database.DUPLICATED));
                    } else {
                        res.status(C.error.database.OPERATION_ERROR.httpCode).send(new
                        api.Error(C.error.database.OPERATION_ERROR));
                    }
                }

            })

        } else {
            res.status(C.error.database.DISCONNECTED.httpCode).send(new
            api.Error(C.error.database.DISCONNECTED));
        }

    } else {
        res.status(C.error.operation.OPERATION_INVALID_PARAMETERS.httpCode).send(new
        api.Error(C.error.operation.OPERATION_INVALID_PARAMETERS));
    }

}

function _read(req, res) {
    const {cid, email, password, name, products} = req.body;


    let db = pdc.db;

    if (cid || email || password || name || products) {
        if (db) {

            let query = {};

            if (cid) query.cid = cid;
            if (email) query.email = email;
            if (password) query.password = password;
            if (name) query.name = name;
            if (products) query.cid = products;


            db.Subscriber.find(query, function (error, data) {

                if (!error) {
                    res.send(new api.Success(data))
                } else {
                    res.status(C.error.database.OPERATION_ERROR.httpCode).send(new
                    api.Error(C.error.database.OPERATION_ERROR));
                }

            })

        } else {
            res.status(C.error.database.DISCONNECTED.httpCode).send(new
            api.Error(C.error.database.DISCONNECTED));
        }
    } else {
        res.status(C.error.operation.OPERATION_INVALID_PARAMETERS.httpCode).send(new
        api.Error(C.error.operation.OPERATION_INVALID_PARAMETERS));
    }


}

function _update(req, res) {
    const {cid, email, password, name, products} = req.body;


    let db = pdc.db;

    if (cid && (email || password || name || products)) {
        if (db) {

            let query = {cid};

            let updateQuery = {};

            if (email) updateQuery.email = email;
            if (password) updateQuery.password = password;
            if (name) updateQuery.name = name;
            if (products) updateQuery.products = products;

            db.Subscriber.update(query, {$set: updateQuery}, function (error, data) {

                if (!error) {
                    if (data.nModified === 1) {
                        res.send(new api.Success({n:data.nModified}));
                    } else {
                        res.send(new api.Success(C.error.operation.NOT_MODIFY))
                    }
                } else {
                    res.status(C.error.database.OPERATION_ERROR.httpCode).send(new
                    api.Error(C.error.database.OPERATION_ERROR));
                }

            })

        } else {
            res.status(C.error.database.DISCONNECTED.httpCode).send(new
            api.Error(C.error.database.DISCONNECTED));
        }
    } else {
        res.status(C.error.operation.OPERATION_INVALID_PARAMETERS.httpCode).send(new
        api.Error(C.error.operation.OPERATION_INVALID_PARAMETERS));
    }

}

function _delete(req, res) {
    const {cid} = req.body;


    let db = pdc.db;

    if (cid) {
        if (db) {

            let query = {cid};

            db.Subscriber.remove(query, function (error, data) {

                if (!error) {
                    if (data.n === 0) {
                        res.status(C.error.operation.TARGET_NOT_FOUND.httpCode).send(new
                        api.Error(C.error.operation.TARGET_NOT_FOUND));
                    } else {
                        res.send(new api.Success({}));
                    }
                } else {
                    res.status(C.error.database.OPERATION_ERROR.httpCode).send(new
                    api.Error(C.error.database.OPERATION_ERROR));
                }

            })

        } else {
            res.status(C.error.database.DISCONNECTED.httpCode).send(new
            api.Error(C.error.database.DISCONNECTED));
        }
    } else {
        res.status(C.error.operation.OPERATION_INVALID_PARAMETERS.httpCode).send(new
        api.Error(C.error.operation.OPERATION_INVALID_PARAMETERS));
    }

}

function _channel_restart(req, res) {
    // TODO TErimanr esto

}