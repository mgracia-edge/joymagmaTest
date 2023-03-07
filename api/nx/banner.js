const api = require('../support');
const codes = require('../codes');
const dc = require('../../lib/dataConnection');
const cloudinary = require('cloudinary');

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

        if (!req.user.permissions.includes(codes.users_permissions.BANNERS_WRITE)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

            return;
        }

        const {name, duration, enabled,start,end,poster} = req.body;

        db.Banner
            .findOne({"name": name}, (error, data) => {
                if (error) {
                    res.status(codes.error.database.DISCONNECTED.httpCode)
                        .send(new api.Error(codes.error.database.DISCONNECTED));
                } else {
                    if (data) {
                        res.status(codes.error.operation.DUPLICATED_ENTITY.httpCode)
                            .send(new api.Error(codes.error.operation.DUPLICATED_ENTITY));
                    } else {

                        db.Banner.findOne({
                            start: {$lte: end},
                            end: {$gte: start}
                          }, (error, data) => {
                            if (error) {
                              res.status(codes.error.database.DISCONNECTED.httpCode).send(new api.Error(codes.error.database.DISCONNECTED));
                            } else if (data) {
                              res.status(codes.error.operation.OVERLAPPING_BANNER.httpCode).send(new api.Error(codes.error.operation.OVERLAPPING_BANNER));
                            } else {
                                let json = {
                                    name: name,
                                    start: start,
                                    end: end,
                                    duration: duration,
                                    enabled: enabled,
                                };

                                json.updateHistory = [{
                                    date: new Date(),
                                    payload: {
                                        ...json
                                    }
                                }];

                                // if (typeof poster !== 'undefined' && poster[0].update && poster[0].update === true) {
                                //     cloudinary.uploader.upload(poster[0].url, (result) => {

                                //         let poster = {
                                //             url: result.url,
                                //             type: db.Channels.poster.LANDSCAPE
                                //         };

                                //         json.poster = [poster];

                                //         _create();
                                //     });

                                // } else {
                                //     _create()
                                // }
                                _create();

                                function _create() {
                                    let banner = new db.Banner(json);

                                    banner.save(json, (err) => {
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
                        })
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

        if (!req.user.permissions.includes(codes.users_permissions.BANNERS_READ)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

            return;
        }

        let {id, data} = req.body;

        let {name, includeUpdateHistory} = data;

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

        db.Banner
            .find(query.find, query.projection)
            .sort(query.sort)
            .then((banners) => {

                res.status(200).send(new api.Success(banners));

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

        if (!req.user.permissions.includes(codes.users_permissions.BANNERS_WRITE)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

            return;
        }

        const {id, data} = req.body;

        const {name, duration,enabled,start,end,poster} = data;

        let query = {
            find: {
                _id: id
            },
            update: {
                $set: {
                    name: name,
                    start:start,
                    end:end,
                    duration: duration,
                    enabled: enabled
                }
            }
        };

        if (typeof name === 'undefined') delete query.update.$set.name;

        // if (typeof poster !== 'undefined' && poster[0].update === true) {
        //     cloudinary.uploader.upload(poster[0].url, (result) => {

        //         let poster = {
        //             url: result.url,
        //             type: db.Channels.poster.LANDSCAPE
        //         };

        //         query.update["$set"].poster = [poster];

        //         _update();
        //     });

        // } else {
        //     _update()
        // }

        _update();

        function _update() {
            db.Banner.updateOne(query.find, query.update, (error, products) => {
                if (error) {
                    res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
                        .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
                } else {
                    res.status(200).send(new api.Success(products));
                }

            });
        }


    } else {

        res.status(codes.error.operation.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }
}

function _delete(req, res) {

    let db = dc.db;

    if (db) {

        if (!req.user.permissions.includes(codes.users_permissions.BANNERS_WRITE)) {

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

        db.Banner
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

