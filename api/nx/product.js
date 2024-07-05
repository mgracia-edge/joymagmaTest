const api = require('../support');
const codes = require('../codes');
const dc = require('../../lib/dataConnection');

exports.resourceList = [
    {
        path: "create",
        callback: _create,
        method: "post",
        protected: true
    },
    {
        path: "read",
        callback: _read,
        method: "post",
        protected: true
    },
    {
        path: "update",
        callback: _update,
        method: "post",
        protected: true
    },
    {
        path: "delete",
        callback: _delete,
        method: "post",
        protected: true
    }];

async function _create(req, res) {
    let db = dc.db;

    if (!db) {

        return res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }

    const {name, channels,description,notes} = req.body;

    if (!req.user.permissions.includes(codes.users_permissions.PRODUCTS_WRITE)) {

        return res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
            .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));
    }

    try {
        const data = await db.Products.findOne({"name": name});

        if (data) {
            return res.status(codes.error.operation.DUPLICATED_ENTITY.httpCode)
                .send(new api.Error(codes.error.operation.DUPLICATED_ENTITY));
        }

        let json = {
            name: name,
            description:description,
            creationDate: new Date(),
            lastUpdate: new Date(),
            channels: channels,
            updateHistory: [{
                date: new Date(),
                products: {
                    channels: channels
                }
            }]
        };

        if (typeof notes !== "undefined") {
            json.notes = notes;
        }

        let Products = new db.Products(json);
        await Products.save(json);

        res.status(200).send(new api.Success({}));
    } catch (error) {

        console.error(`Error in api/nx/product.js -- _create service: ${error.message}`)
        res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
            .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
    }
}

async function _read(req, res) {
    let db = dc.db;

    if (!db) {

        return res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }

    if (!req.user.permissions.includes(codes.users_permissions.PRODUCTS_READ)) {

        res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
            .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

        return;
    }

    let {id, name, includeUpdateHistory, includeChannels} = req.body;

    let query = {
        find: {},
        projection: {
            updateHistory: 0
        },
        sort: {
            name: 1
        }
    };

    if (id) {

        query.find = {_id: Array.isArray(id) ? {$in: id} : id}

    } else if (name) {

        query.find = {name: Array.isArray(name) ? {$in: name} : name}

    }

    if (typeof includeUpdateHistory !== "undefined" && includeUpdateHistory) {

        delete query.projection.updateHistory;

    }

    if (typeof includeChannels !== "undefined" && !includeChannels) {

        query.projection.channels = 0;

    }

    db.Products
        .find(query.find, query.projection)
        .sort(query.sort)
        .then((products) => {

            res.status(200).send(new api.Success(products));

        }).catch((error) => {
            console.error(`Error in api/nx/product.js -- _read service: ${error.message}`)
            res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
                .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
        })
}

async function _update(req, res) {
    let db = dc.db;

    if (!db) {

        return res.status(codes.error.operation.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }

    if (!req.user.permissions.includes(codes.users_permissions.PRODUCTS_WRITE)) {

        res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
            .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

        return;
    }

    const {id, data} = req.body;

    const {name, channels,description,notes} = data;

    let query = {
        find: {
            _id: id
        },
        update: {
            $set: {
                name: name,
                description:description,
                lastUpdate: new Date(),
                channels: channels,
                notes:notes

            },
            $push: {
                updateHistory: {
                    date: new Date(),
                    products: {
                        channels: channels
                    }
                }
            }
        }
    };

    if (typeof channels === 'undefined') delete query.update.$set.channels;
    if (typeof name === 'undefined') delete query.update.$set.name;
    if (typeof description === 'undefined') delete query.update.$set.description;
    if (typeof notes === 'undefined') delete query.update.$set.notes;

    try {
        const products = await db.Products.updateOne(query.find, query.update);        
        
        res.status(200).send(new api.Success(products));
    } catch (error) {
        console.error(`Error in api/nx/product.js -- _update service: ${error.message}`)
        res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
            .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
    }

}

async function _delete(req, res) {
    let db = dc.db;

    if (!db) {

        return res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }

    if (!req.user.permissions.includes(codes.users_permissions.PRODUCTS_WRITE)) {

        res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
            .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

        return;
    }

    const {id} = req.body;

    let query = {
        find: {
            _id: Array.isArray(id) ? {$in: id} : id
        }
    };

    await db.Products
        .remove(query.find)
        .then(() => {

            res.status(200).send(new api.Success({}));
        }).catch((error) => {

            console.error(`Error in api/nx/product.js -- _delete service: ${error.message}`)
            res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
                .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
        })
}

