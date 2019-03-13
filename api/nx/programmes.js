const api = require('../support');
const codes = require('../codes');
const dc = require('../../lib/dataConnection');

exports.resourceList = [
    {
        path: "read",
        callback: _read,
        method: "post",
        protected: true
    },{
        path: "channels",
        callback: _channels,
        method: "post",
        protected: true
    }];


function _channels(req, res){
    let db = dc.db;

    if (db) {

        if (!req.user.permissions.includes(codes.users_permissions.USER_ADMIN)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

            return;
        }

        db.Programme
            .distinct("channelEPGId")
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

function _read(req, res) {
    let db = dc.db;

    if (db) {

        if (!req.user.permissions.includes(codes.users_permissions.CHANNELS_READ)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

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


        let today = new Date().setHours(0, 0, 0);
        let todayAtNight = new Date().setHours(23, 59, 59);

        query.find.start = { $gte : today};
        query.find.stop = { $lte : todayAtNight};

        db.Programme
            .find(query.find, query.projection)
            .limit(1000)
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

