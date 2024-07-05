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
        path: "channel_restart",
        callback: _channel_restart,
        method: "post",
        protected: false
    },
    {
        path: "channel_get",
        callback: _channel_get,
        method: "post",
        protected: false
    }

];

/** API Interface  ***/


async function _create(req, res) {
    const { cid, email, password, name, products } = req.body;
    let db = pdc.db;

    const CURRENT_DATE = new Date();

    if (!cid || !email || !password || !name || !products) {
        return res.status(C.error.operation.OPERATION_INVALID_PARAMETERS.httpCode).send(new
            api.Error(C.error.operation.OPERATION_INVALID_PARAMETERS));
    }

    if (!db) {
        return res.status(C.error.database.DISCONNECTED.httpCode).send(new
            api.Error(C.error.database.DISCONNECTED));
    }

    try {
        await db.Subscriber.create({
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
            } else {

            }
    
        });

        res.send(new api.Success({}))
    } catch (error) {
        console.log(`Error in ext/comm.js -- _create service: ${error.message}`)

        if (error.code === 11000) {
            res.status(C.error.database.DUPLICATED.httpCode).send(new
            api.Error(C.error.database.DUPLICATED));
        } else {
            res.status(C.error.database.OPERATION_ERROR.httpCode).send(new
            api.Error(C.error.database.OPERATION_ERROR));
        }   
    }
}

async function _read(req, res) {
    const {cid, email, password, name, products} = req.body;
    let db = pdc.db;

    if (!db) {

        return res.status(C.error.database.DISCONNECTED.httpCode).send(new
            api.Error(C.error.database.DISCONNECTED));
    }

    if (!cid && !email && !password && !name && !products) {

        return res.status(C.error.operation.OPERATION_INVALID_PARAMETERS.httpCode).send(new
            api.Error(C.error.operation.OPERATION_INVALID_PARAMETERS));
    }

    let query = {};

    if (cid) query.cid = cid;
    if (email) query.email = email;
    if (password) query.password = password;
    if (name) query.name = name;
    if (products) query.cid = products;

    try {
        const data = await db.Subscriber.find(query);

        res.send(new api.Success(data))
    } catch (error) {
        console.log(`Error in ext/comm.js -- _read service: ${error.message}`)
        res.status(C.error.database.OPERATION_ERROR.httpCode).send(new
            api.Error(C.error.database.OPERATION_ERROR));
    }
}

async function _update(req, res) {
    const {cid, email, password, name, products} = req.body;
    let db = pdc.db;

    if (!cid || (!email && !password && !name && !products) ) {
        return res.status(C.error.operation.OPERATION_INVALID_PARAMETERS.httpCode).send(new
            api.Error(C.error.operation.OPERATION_INVALID_PARAMETERS));
    }

    if (!db) {
        return res.status(C.error.database.DISCONNECTED.httpCode).send(new
            api.Error(C.error.database.DISCONNECTED));
    }

    let query = {cid};

    let updateQuery = {};

    if (email) updateQuery.email = email;
    if (password) updateQuery.password = password;
    if (name) updateQuery.name = name;
    if (products) updateQuery.products = products;

    try {
        
        const subscriber = await db.Subscriber.updateOne(query, {$set: updateQuery});

        if (subscriber.nModified === 1) {
            res.status(200).send(new api.Success({n: subscriber.nModified}));
        } else {
            res.status(200).send(new api.Success(C.error.operation.NOT_MODIFY))
        }

    } catch (error) {
        console.error(`Error in ext/comm.js -- _update service: ${error.message}`)

        res.status(C.error.database.OPERATION_ERROR.httpCode).send(new
            api.Error(C.error.database.OPERATION_ERROR));
    }

}

async function _delete(req, res) {
    const {cid} = req.body;
    let db = pdc.db;
    
    if (!cid) { 
        return res.status(C.error.operation.OPERATION_INVALID_PARAMETERS.httpCode).send(new
            api.Error(C.error.operation.OPERATION_INVALID_PARAMETERS));
    }

    if (!db) {
        return res.status(C.error.database.DISCONNECTED.httpCode).send(new
        api.Error(C.error.database.DISCONNECTED));
    }

    try {
        let query = {cid};

        const subscriber = await db.Subscriber.findOneAndDelete(query);

        if (subscriber.n === 0) {
            res.status(C.error.operation.TARGET_NOT_FOUND.httpCode).send(new
            api.Error(C.error.operation.TARGET_NOT_FOUND));
        } else {
            res.send(new api.Success({}));
        }
    } catch (error) {
        console.error(`Error in ext/comm.js -- _delete service: ${error.message}`)
        res.status(C.error.database.OPERATION_ERROR.httpCode).send(new
            api.Error(C.error.database.OPERATION_ERROR));
    }
}

async function _channel_restart(req, res) {
    let db = pdc.db;
    let { id } = req.body;

    const EP = {
        'EP-01':'131.255.63.146',
        'EP-02':'131.255.63.155',
        'EP-05':'131.255.63.158',
        'EP-06':'131.255.63.154'
    };

    if (!db) {
        return res.status(C.error.database.DISCONNECTED.httpCode).send(new
        api.Error(C.error.database.DISCONNECTED));
    }

    try {
        let query = {_id: id};

        const data = await db.Channels.findOne(query)

        if (!data || data.source) {
            return res.status(C.error.operation.TARGET_NOT_FOUND.httpCode).send(new
                api.Error(C.error.operation.TARGET_NOT_FOUND));
        }

        const ep = EP[data.source.entrypointId];
        const URL = `http://${ep}/restart/${data.entryPoint.streamKey}`;

        request(URL, function (error, response, body) {
            if(error){
                res.status(C.error.operation.OPERATION_HAS_FAILED.httpCode).send(new
                    api.Error(C.error.operation.OPERATION_HAS_FAILED)
                );
            }else{
                res.send(new api.Success({serverResponse: body}));
            }
        });
    } catch (error) {
        console.error(`Error in ext/comm.js -- _channel_restart service: ${error.message}`)

        res.status(C.error.operation.OPERATION_HAS_FAILED.httpCode).send(new
            api.Error(C.error.operation.OPERATION_HAS_FAILED));
    }
}

async function _channel_get(req, res) {
    let db = pdc.db;

    if (!db) {
        res.status(C.error.database.DISCONNECTED.httpCode).send(new
        api.Error(C.error.database.DISCONNECTED));
    }

    let query = {enabled: true};

    try {
        const channels = await db.Channels.find(query)
        
        res.send(new api.Success(channels));
    } catch (error) {
        console.error(`Error in ext/comm.js -- _channel_get service: ${error.message}`)
        res.status(C.error.database.OPERATION_ERROR.httpCode).send(new
            api.Error(C.error.database.OPERATION_ERROR));
    }


}