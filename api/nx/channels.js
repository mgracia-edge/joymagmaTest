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

        if(!req.user.permissions.includes(codes.users_permissions.CHANNELS_WRITE)){

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.DISCONNECTED));

            return;
        }

        const {channelEPGId, name, descriptionShort, descriptionLong, publishing} = req.body;

        db.Channels
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
                            channelEPGId: channelEPGId,
                            name: name,
                            descriptionShort: descriptionShort,
                            descriptionLong: descriptionLong,
                            publishing: publishing,
                            updateHistory: [{
                                date: new Date(),
                                payload: {
                                    channelEPGId: channelEPGId,
                                    name: name,
                                    descriptionShort: descriptionShort,
                                    descriptionLong: descriptionLong,
                                    publishing: publishing,
                                }
                            }]
                        };

                        if (typeof descriptionShort === 'undefined') delete json.descriptionShort;
                        if (typeof descriptionLong === 'undefined') delete json.descriptionLong;

                        let Channels = new db.Channels(json);

                        Channels.save(json, (err) => {
                            if (err) {
                                console.log(err)
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

        if(!req.user.permissions.includes(codes.users_permissions.CHANNELS_READ)){

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.DISCONNECTED));

            return;
        }

        let {id, name, includeUpdateHistory} = req.body;

        let query = {
            find: {},
            projection: {
                updateHistory: 0
            },
            sort: {
                productName: 1
            }
        };

        if (id) {

            query.find = {_id: Array.isArray(id) ? {$in: id} : id}

        } else if (name) {

            query.find = {productName: Array.isArray(name) ? {$in: name} : name}

        }

        if (typeof includeUpdateHistory !== "undefined" && includeUpdateHistory) {

            delete query.projection.updateHistory;

        }

        db.Channels
            .find(query.find, query.projection)
            .sort(query.sort)
            .then((channels) => {

                res.status(200).send(new api.Success(channels));

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

        if(!req.user.permissions.includes(codes.users_permissions.CHANNELS_WRITE)){

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.DISCONNECTED));

            return;
        }

        const {id, data} = req.body;

        const {channelEPGId, name, descriptionShort, descriptionLong, publishing} = data;

        let query = {
            find: {
                _id: id
            },
            update: {
                $set: {
                    channelEPGId: channelEPGId,
                    name: name,
                    descriptionShort: descriptionShort,
                    descriptionLong: descriptionLong,
                    publishing: publishing
                },
                $push: {
                    updateHistory: {
                        date: new Date(),
                        payload: {}
                    }
                }
            }
        };

        if (typeof channelEPGId === 'undefined') delete query.update.$set.channelEPGId;
        if (typeof name === 'undefined') delete query.update.$set.name;
        if (typeof descriptionShort === 'undefined') delete query.update.$set.descriptionShort;
        if (typeof descriptionLong === 'undefined') delete query.update.$set.descriptionLong;
        if (typeof publishing === 'undefined') delete query.update.$set.publishing;

        query.update.$push.updateHistory.payload = query.update.$set;

        db.Channels.updateOne(query.find, query.update, (error, products) => {
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

        if(!req.user.permissions.includes(codes.users_permissions.CHANNELS_WRITE)){

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

        db.Channels
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

