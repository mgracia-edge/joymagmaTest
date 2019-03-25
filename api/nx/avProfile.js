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

        if (!req.user.permissions.includes(codes.users_permissions.USER_ADMIN)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

            return;
        }

        const {name,description,dvr,aesEncryptor,quality,encoder,profile} = req.body;

        db.AvProfile
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
                            name,
                            description,
                            dvr,
                            aesEncryptor,
                            quality,
                            encoder,
                            profile
                        };

                        let AvProfile = new db.AvProfile(json);

                        AvProfile.save(json, (err) => {
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

        if (!req.user.permissions.includes(codes.users_permissions.USER_ADMIN)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

            return;
        }

        let {id} = req.body;

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
        }

        db.AvProfile
            .find(query.find, query.projection)
            .sort(query.sort)
            .then((channels) => {

                res.status(200).send(new api.Success(channels));

            }).catch((error) => {
            console.error(error);
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

        if (!req.user.permissions.includes(codes.users_permissions.USER_ADMIN)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

            return;
        }

        const {id, data} = req.body;

        const {name,description,dvr,aesEncryption,codec,profile,fps,chunkFile,keyRate} = data;

        let query = {
            find: {
                _id: id
            },
            update: {
                $set: {
                    name,
                    description,
                    dvr,
                    aesEncryption,
                    codec,
                    profile,fps,chunkFile,keyRate
                }
            }
        };

        if (typeof name === 'undefined') delete query.update.$set.name;
        if (typeof description === 'undefined') delete query.update.$set.description;
        if (typeof dvr === 'undefined') delete query.update.$set.dvr;
        if (typeof aesEncryption === 'undefined') delete query.update.$set.aesEncryption;
        if (typeof codec === 'undefined') delete query.update.$set.codec;
        if (typeof profile === 'undefined') delete query.update.$set.profile;
        if (typeof fps === 'undefined') delete query.update.$set.fps;
        if (typeof chunkFile === 'undefined') delete query.update.$set.chunkFile;
        if (typeof keyRate === 'undefined') delete query.update.$set.keyRate;

        db.AvProfile.updateOne(query.find, query.update, (error, products) => {
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

        if (!req.user.permissions.includes(codes.users_permissions.USER_ADMIN)) {

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

        db.AvProfile
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
