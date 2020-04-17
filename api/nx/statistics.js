const api = require('../support');
const codes = require('../codes');
const dc = require('../../lib/dataConnection');

exports.resourceList = [
    {
        path: "subscribers",
        callback: _subscribers,
        method: "post",
        protected: true
    }, {
        path: "dailyPlay",
        callback: _dailyPlay,
        method: "post",
        protected: true
    }];

function _subscribers(req, res) {
    let db = dc.db;

    if (db) {

        if (!req.user.permissions.includes(codes.users_permissions.STATS_ACCESS)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

            return;
        }

        let {from, until} = req.body;

        db.StatsDailyInstalls.find({date: {$gte: new Date(from), $lte: new Date(until)}}, (error, data) => {
            res.send(new api.Success(data));
        });

    } else {

        res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }

}

function _dailyPlay(req, res) {
    let db = dc.db;

    if (db) {

        if (!req.user.permissions.includes(codes.users_permissions.STATS_ACCESS)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

            return;
        }

        let {from, until} = req.body;

        db.StatsDailyPlayingResume.find({date: {$gte: new Date(from), $lte: new Date(until)}}, (error, data) => {
            res.send(new api.Success(data));
        });

    } else {

        res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }

}