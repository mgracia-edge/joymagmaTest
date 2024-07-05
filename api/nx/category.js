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

async function _create(req, res) {
    let db = dc.db;

    if (!db) {

        return res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }

        if (!req.user.permissions.includes(codes.users_permissions.CHANNELS_WRITE)) {

            return res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));
        }

        const { name, descriptionShort, descriptionLong } = req.body;

        try {
            const data = await db.Category.findOne({"name": name});

            if (data) {
                return res.status(codes.error.operation.DUPLICATED_ENTITY.httpCode)
                    .send(new api.Error(codes.error.operation.DUPLICATED_ENTITY));
            } 

            let json = {
                name: name,
                descriptionShort: descriptionShort,
                descriptionLong: descriptionLong
            };

            json.updateHistory = [{
                date: new Date(),
                payload: {
                    ...json
                }
            }];

            if (typeof descriptionShort === 'undefined') delete json.descriptionShort;
            if (typeof descriptionLong === 'undefined') delete json.descriptionLong;

            let category = new db.Category(json);
            await category.save(json);
            
            res.status(200).send(new api.Success({}));
        } catch (error) {

            console.error(`Error in api/nx/category.js -- _create service: ${error.message}`)
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

    if (!req.user.permissions.includes(codes.users_permissions.CHANNELS_READ)) {

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

    await db.Category
        .find(query.find, query.projection)
        .sort(query.sort)
        .then((channels) => {

            res.status(200).send(new api.Success(channels));

        }).catch((error) => {
            console.log(error)
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

    if (!req.user.permissions.includes(codes.users_permissions.CHANNELS_WRITE)) {

        res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
            .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

        return;
    }

    const {id, data} = req.body;

    const {name, descriptionShort, descriptionLong, priority} = data;

    let query = {
        find: {
            _id: id
        },
        update: {
            $set: {
                name: name,
                descriptionShort: descriptionShort,
                descriptionLong: descriptionLong,
                priority: priority
            }
        }
    };

    if (typeof name === 'undefined') delete query.update.$set.name;
    if (typeof descriptionShort === 'undefined') delete query.update.$set.descriptionShort;
    if (typeof descriptionLong === 'undefined') delete query.update.$set.descriptionLong;

    try {
        const category = await db.Category.updateOne(query.find, query.update);
        
        res.status(200).send(new api.Success(category));
    } catch (error) {

        console.error(`Error in api/nx/category.js -- _update service: ${error.message}`)
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

    if (!req.user.permissions.includes(codes.users_permissions.CHANNELS_WRITE)) {

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

    await db.Category
        .remove(query.find)
        .then((data) => {

            res.status(200).send(new api.Success({}));

        }).catch((error) => {

            console.error(`Error in api/nx/category.js -- _delete service: ${error.message}`)
            res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
                .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
        })
}

