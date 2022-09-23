const api = require('../support');
const codes = require('../codes');
const dc = require('../../lib/dataConnection');
const stats = require('../../lib/stats');

exports.resourceList = [
    {
        path: "subscribers",
        callback: _subscribers,
        method: "post",
        protected: true
    },{
        path: "dailyPlay",
        callback: _dailyPlay,
        method: "post",
        protected: true
    },{
        path: "devices",
        callback: _devices,
        method: "post",
        protected: true
    },{
        path: "report",
        callback: _report,
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

        // db.StatsDailyInstalls.find({date: {$gte: new Date(from), $lte: new Date(until)}}, (error, data) => {
        //     res.send(new api.Success(data));
        // });

        db.StatsDailySubscribers.find({fromDate: {$gte: new Date(from), $lte: new Date(until)}}, (error, data) => {
            res.send(new api.Success(data));
        });

    } else {

        res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }

}

async function _dailyPlay(req, res) {
    let db = dc.db;

    if (db) {

        if (!req.user.permissions.includes(codes.users_permissions.STATS_ACCESS)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

            return;
        }

        let {from, until, aggregation} = req.body;

        let dateFrom = new Date(from);
        let dateUntil = new Date(until);

        const aditionalSearchs = {};

        if(!aggregation){
            aggregation = defAggregation(dateFrom, dateUntil);
        }else{
            aggregation = checkLinesByAggregation(dateFrom, dateUntil, aggregation, stats.C);
        }

        // const pipeline = [
        //     {
        //       '$match': {
        //         'date': {
        //           '$gte': new Date(from), 
        //           '$lt': new Date(until)
        //         }, 
        //         'aggregation': aggregation,
        //         ...aditionalSearchs
        //       }
        //     }, {
        //       '$project': {
        //         'perChannel': 0, 
        //         'sessions': 0, 
        //         'aggregation': 0, 
        //         '__v': 0
        //       }
        //     }, {
        //       '$group': {
        //         '_id': '$date', 
        //         'concurrency': {
        //           '$sum': '$concurrency'
        //         }, 
        //         'playTime': {
        //           '$sum': '$playTime'
        //         }, 
        //         'numberOfSubscribers': {
        //           '$sum': '$numberOfSubscribers'
        //         }
        //       }
        //     }, {
        //       '$project': {
        //         'date': '$_id', 
        //         '_id': 0, 
        //         'concurrency': 1, 
        //         'playTime': 1, 
        //         'numberOfSubscribers': 1
        //       }
        //     }, {
        //       '$sort': {
        //         'date': 1
        //       }
        //     }
        // ];
        // let data = await db.StatsResume.aggregate(pipeline);

        let data = await db.StatsResume.find({
            date: {$gte: new Date(from), $lt: new Date(until)},
            aggregation: aggregation, 
            device: "android_tv"
            }, {
                aggregation: 0,
                perChannel: 0, 
                __v: 0
            }
        );


        res.send(new api.Success(data));

    } else {

        res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }

}

async function _report(req, res) {
    let db = dc.db;

    if (db) {

        if (!req.user.permissions.includes(codes.users_permissions.STATS_ACCESS)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

            return;
        }

        let {from, until, aggregation} = req.body;

        let dateFrom = new Date(from);
        let dateUntil = new Date(until);

        if(!aggregation){
            aggregation = defAggregation(dateFrom, dateUntil);
        }else{
            aggregation = checkLinesByAggregation(dateFrom, dateUntil, aggregation, stats.C);
        }

        let data = await db.StatsResume.find({date: {$gte: new Date(from), $lte: new Date(until)},aggregation:aggregation, device: "android_tv"},{sessions:0,aggregation:0});
        res.send(new api.Success(data));

    } else {

        res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }

}

async function _devices(req, res) {
    let db = dc.db;

    if (db) {

        if (!req.user.permissions.includes(codes.users_permissions.STATS_ACCESS)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

            return;
        }

        let {from, until, aggregation} = req.body;

        let dateFrom = new Date(from);
        let dateUntil = new Date(until);

        if(!aggregation){
            aggregation = defAggregation(dateFrom, dateUntil);
        }else{
            aggregation = checkLinesByAggregation(dateFrom, dateUntil, aggregation, stats.C);
        }

        let data = await db.StatsResume.find({
            date: {$gte: new Date(from), $lt: new Date(until)},
            aggregation: aggregation
            }, {
                sessions: 0,
                aggregation: 0,
                perChannel: 0, 
                __v: 0

            }
        );
        res.send(new api.Success(data));

    } else {

        res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }

}

function defAggregation(dateFrom, dateUntil) {
    let delta = Math.abs((dateUntil.getTime() - dateFrom.getTime()) / 86400000);
    let aggregation = stats.C.aggregation.PER_DAY;

    if(delta < 2){ // < 1
        aggregation = stats.C.aggregation.PER_MIN;
    }else if(delta < 3){
        aggregation = stats.C.aggregation.PER_5MIN;
    }else if(delta < 10){
        aggregation = stats.C.aggregation.PER_QTR_HR;
    }else if(delta < 16){ // < 20
        aggregation = stats.C.aggregation.PER_HLF_LF;
    }else if(delta < 32){ // < 41
        aggregation = stats.C.aggregation.PER_HR;
    }

    return aggregation;
}

function getMinutesByAggregation(aggregation, constants) {
    return constants.aggregationMinutes[aggregation] ?? 1;
}

function checkLinesByAggregation(dateFrom, dateUntil, aggregation, constants) {
    let deltaMinutes = Math.abs((dateUntil.getTime() - dateFrom.getTime()) / 60000);
    if ((deltaMinutes / getMinutesByAggregation(aggregation, constants)) > constants.MAX_GRAPH_LINES) {
        return defAggregation(dateFrom, dateUntil);
    }
    return aggregation;
} 