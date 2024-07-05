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

    if (!req.user.permissions.includes(codes.users_permissions.USER_ADMIN)) {

        res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
            .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

        return;
    }

    const {name,description,dvr,aesEncryptor,quality,encoder,profile} = req.body;

    try {
        const data = await db.AvProfile.findOne({"name": name});

        if (data) {
            return res.status(codes.error.operation.DUPLICATED_ENTITY.httpCode)
                .send(new api.Error(codes.error.operation.DUPLICATED_ENTITY));
        } 

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

        await AvProfile.save(json);
        
        res.status(200).send(new api.Success({}));
    } catch (error) {
        console.error(`Error in api/nx/avProfile.js -- _create service: ${error.message}`)
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

    await db.AvProfile
            .find(query.find, query.projection)
            .sort(query.sort)
            .then((channels) => {

                res.status(200).send(new api.Success(channels));

            }).catch((error) => {
            console.error(error);
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

    try {
        const products = await db.AvProfile.updateOne(query.find, query.update);

        res.status(200).send(new api.Success(products));
    } catch (error) {
        console.error(`Error in api/nx/avProfile.js -- _update service: ${error.message}`)
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

    await db.AvProfile
        .remove(query.find)
        .then((data) => {

            res.status(200).send(new api.Success({}));
        }).catch((error) => {
            console.error(`Error in api/nx/avProfile.js -- _delete service: ${error.message}`)
            res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
                .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
        })

}
