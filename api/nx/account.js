const api = require('../support');
const codes = require('../codes');
const dc = require('../../lib/dataConnection');
const cloudinary = require('cloudinary');

exports.resourceList = [
    {
        path: "get",
        callback: _get,
        method: "post",
        protected: true
    },{
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

async function _get(req, res) {
    let db = dc.db;

    if (!db) {
        return res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }

    try {
        // TODO Check if user can access the account
        const data = await db.Account.findOne({_id: req.body.id})

        if (!data) {
            return res.status(codes.error.operation.TARGET_NOT_FOUND.httpCode)
            .send(new api.Error(codes.error.operation.TARGET_NOT_FOUND));
        }

        res.status(200).send(new api.Success(data));
    } catch (error) {
        console.log(`Error in api/nx/account.js -- _get service: ${error.message}`)
        res.status(codes.error.database.OPERATION_ERROR.httpCode)
            .send(new api.Error(codes.error.database.OPERATION_ERROR));
    }
}

/* CRUD */

/* TODO: */
function _create(req, res) {
    let db = dc.db;

    if (db) {

        if (!req.user.permissions.includes(codes.users_permissions.USER_ADMIN)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

            return;
        }

    } else {

        res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }
}
/* TODO: */
function _read(req, res) {
    let db = dc.db;

    if (db) {

        if (!req.user.permissions.includes(codes.users_permissions.USER_ADMIN)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

            return;
        }

    } else {

        res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }
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

    const {name, description, logo} = data;

    let query = {
        find: {
            _id: id
        },
        update: {
            $set: {}
        }
    };

    if (typeof name !== 'undefined') query.update.$set["name"] = name;
    if (typeof description !== 'undefined') query.update.$set["description"] = description;

    if(typeof logo !== 'undefined' && logo.update === true){
        cloudinary.uploader.upload(logo.url, (result) => {
            query.update.$set["logo.url"] = result.url;
        })
    }

    try {
        const products = await db.Account.updateOne(query.find, query.update);
        
        res.status(200).send(new api.Success(products));
    } catch (error) {
        console.error(`Error in api/nx/account.js -- _update service: ${error.message}`)
        res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
            .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
    }
}
/* TODO: */
function _delete(req, res) {

    let db = dc.db;

    if (db) {

        if (!req.user.permissions.includes(codes.users_permissions.USER_ADMIN)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

            return;
        }

    } else {

        res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }
}