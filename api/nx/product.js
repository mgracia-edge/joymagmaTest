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

function _create(req, res) {
    let db = dc.db;

    if (db) {

        const {name, channels,description} = req.body;

        if (!req.user.permissions.includes(codes.users_permissions.PRODUCTS_WRITE)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

            return;
        }

        db.Products
            .findOne({"name": name}, (error, data) => {
                if (error) {
                    res.status(codes.error.database.DISCONNECTED.httpCode)
                        .send(new api.Error(codes.error.database.DISCONNECTED));
                } else {
                    if (data) {
                        res.status(codes.error.operation.DUPLICATED_ENTITY.httpCode)
                            .send(new api.Error(codes.error.operation.DUPLICATED_ENTITY));
                    } else {
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

                        let Products = new db.Products(json);

                        Products.save(json, (err) => {
                            if (err) {
                                res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
                                    .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
                            } else {
                                res.status(200).send(new api.Success({}));

                            }

                        });
                    }
                }
            });

    } else {

        res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }
}

function _read(req, res) {
    let db = dc.db;

    if (db) {

        if (!req.user.permissions.includes(codes.users_permissions.PRODUCTS_READ)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.DISCONNECTED));

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
            console.log(error)
            res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
                .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
        })

    } else {

        res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }
}

function _update(req, res) {
    let db = dc.db;

    if (db) {

        if (!req.user.permissions.includes(codes.users_permissions.PRODUCTS_WRITE)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.DISCONNECTED));

            return;
        }

        const {id, data} = req.body;

        const {name, channels,description} = data;

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

        db.Products.updateOne(query.find, query.update, (error, products) => {
            if (error) {
                res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
                    .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
            } else {
                res.status(200).send(new api.Success(products));
            }

        });

    } else {

        res.status(codes.error.operation.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }
}

function _delete(req, res) {

    let db = dc.db;

    if (db) {

        if (!req.user.permissions.includes(codes.users_permissions.PRODUCTS_WRITE)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.DISCONNECTED));

            return;
        }

        const {id} = req.body;

        let query = {
            find: {
                _id: Array.isArray(id) ? {$in: id} : id
            }
        };

        db.Products
            .remove(query.find)
            .then((data) => {

                res.status(200).send(new api.Success({}));

            }).catch((error) => {

            res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
                .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
        })

    } else {

        res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }
}

