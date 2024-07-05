const api = require('../support');
const codes = require('../codes');
const dc = require('../../lib/dataConnection');

exports.resourceList = [
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
    }];


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

    let query = {
        find: {}
    };

    await db.OttConfigurations
        .findOne(query.find)
        .then((ottConfigurations) => {

            res.status(200).send(new api.Success(ottConfigurations));
        }).catch((error) => {

            console.error(`Error in api/nx/ottConfigurations.js -- _read service: ${error.message}`)
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

    const {keepWatchingWarning, screens} = data;

    let query = {
        find: {
            _id: id
        },
        update: {
            $set: {
                keepWatchingWarning,
                screens
            }
        }
    };

    try {
        const ottConfigurations = await db.OttConfigurations.updateOne(query.find, query.update);

        res.status(200).send(new api.Success(ottConfigurations));
    } catch (error) {
        console.error(`Error in api/nx/ottConfigurations.js -- _update service: ${error.message}`)
        res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
            .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
    }
}


