const api = require('../support');
const codes = require('../codes');
const dc = require('../../lib/dataConnection');

exports.resourceList = [
    {
        path: "read",
        callback: _read,
        method: "post",
        protected: true
    }];

async function _read(req, res) {
    let db = dc.db;

    if (!db) {

        return res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }

    if (!req.user.permissions.includes(codes.users_permissions.SUBSCRIBERS_READ)) {

        res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
            .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

        return;
    }

    let {id,includeUpdateHistory} = req.body;

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

    if (typeof includeUpdateHistory !== "undefined" && includeUpdateHistory) {

        delete query.projection.updateHistory;

    }

    await db.Subscribers
        .find(query.find, query.projection)
        .sort(query.sort)
        .then((channels) => {

            res.status(200).send(new api.Success(channels));

        }).catch((error) => {
            console.error(`Error in api/nx/subscriber -- _read service: ${error.message}`);
            res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
                .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
        })

}