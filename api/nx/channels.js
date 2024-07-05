const api = require('../support');
const codes = require('../codes');
const dc = require('../../lib/dataConnection');
const cloudinary = require('cloudinary');
const request = require('request');

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
    },
    {
        path: "restartPush",
        callback: _restartPush,
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

        res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
            .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

        return;
    }

    const {channelEPGId, name, descriptionShort, descriptionLong, category, poster, notes, enabled, moviesNow, psVOD, source} = req.body;

    try {
        const data = await db.Channels
        .findOne({"name": name});

        if (!data) {
            return res.status(codes.error.operation.DUPLICATED_ENTITY.httpCode)
                .send(new api.Error(codes.error.operation.DUPLICATED_ENTITY));
        } 

        let json = {
            channelEPGId: channelEPGId,
            name: name,
            descriptionShort: descriptionShort,
            descriptionLong: descriptionLong,
            publishing: {
                type: db.Channels.publishingType.HLS,
                streamName: api.newStreamKeyCode()
            },
            source,
            enabled: enabled,
            notes: notes,
            category: category,
            entryPoint: {
                type: db.Channels.entryPoint.RTMP,
                streamKey: api.newStreamKeyCode()
            },
            moviesNow: moviesNow ?? false,
            psVOD : psVOD ?? false
        };

        json.updateHistory = [{
            date: new Date(),
            payload: {
                ...json
            }
        }];

        if (typeof descriptionShort === 'undefined') delete json.descriptionShort;
        if (typeof descriptionLong === 'undefined') delete json.descriptionLong;
        if (typeof notes === 'undefined') delete json.notes;
        if (typeof enabled === 'undefined') delete json.enabled;

        if (typeof poster !== 'undefined' && poster[0].update && poster[0].update === true) {
            cloudinary.uploader.upload(poster[0].url, (result) => {

                let poster = {
                    url: result.url,
                    type: db.Channels.poster.LANDSCAPE
                };

                json.poster = [poster];
            });
            console.log(`Error in cloudinary service: \n ${error}`)
            json.poster = [{
                url: 'url',
                type: 'LANDSCAPE'
            }]
        }

        let Channels = new db.Channels(json);

        await Channels.save(json);
        res.status(200).send(new api.Success({}));
    } catch (error) {

        console.error(`Error in api/nx/channels.js -- _create service: ${error.message}`)
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

    let {name, channelEPGId, includeUpdateHistory} = data;

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

    } else if (channelEPGId) {
        query.find = {channelEPGId: Array.isArray(channelEPGId) ? {$in: channelEPGId} : name}
    }

    if (typeof includeUpdateHistory !== "undefined" && includeUpdateHistory) {

        delete query.projection.updateHistory;

    }

    await db.Channels
        .find(query.find, query.projection)
        .sort(query.sort)
        .then((channels) => {

            res.status(200).send(new api.Success(channels));
        }).catch((error) => {
            console.error(`Error in api/nx/channels.js -- _read service: ${error.message}`)
            res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
                .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
        })

}

async function _restartPush(req, res) {
    let db = dc.db;
    let {id} = req.body;

    const EP = {
        'EP-01':'131.255.63.146',
        'EP-02':'131.255.63.155',
        'EP-05':'131.255.63.158',
        'EP-06':'131.255.63.154'
    };

    if (!db) {
        return res.status(codes.error.database.DISCONNECTED.httpCode).send(new
           api.Error(codes.error.database.DISCONNECTED));
    }

    let query = {_id: id};

    try {
        const channels = await db.Channels.findOne(query);
        
        if (!channels || channels.source) {

            return res.status(codes.error.operation.TARGET_NOT_FOUND.httpCode).send(new
                api.Error(codes.error.operation.TARGET_NOT_FOUND));
        }

        const ep = EP[channels.source.entrypointId];
        const URL = `http://${ep}/restart/${channels.entryPoint.streamKey}`;

        request(URL, function (error, response, body) {
            if (error) {

                console.error(`Error in api/nx/channels.js -- _restartPush service on request callback: ${error.message}`);
                res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
                    .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED))      
            } else {
                res.send(new api.Success({serverResponse: body}));
            }
        });
    } catch (error) {

        console.error(`Error in api/nx/channels.js -- _restartPush service: ${error.message}`);
        res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode).send(new
            api.Error(codes.error.operation.OPERATION_HAS_FAILED)
        );
    }
}

async function _update(req, res) {
    let db = dc.db;

    if (!db) {

        return res.status(codes.error.operation.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }

    if (!req.user.permissions.includes(codes.users_permissions.CHANNELS_WRITE)) {

        return res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
            .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));
    }

    const {id, data} = req.body;

    const {
        channelEPGId, name, descriptionShort, descriptionLong, category, poster, notes, enabled, source,
        transcoder, profile, deinterlace, aspectRatio, forceX264, sd, priority, monitoring,
        h265, useMpkg, dvr24,featured, liveNow, 
        moviesNow,psVOD
    } = data;

    let query = {
        find: {
            _id: id
        },
        update: {
            $set: {
                channelEPGId: channelEPGId,
                name: name,
                enabled: enabled,
                descriptionShort: descriptionShort,
                descriptionLong: descriptionLong,
                category: category,
                notes: notes,
                source: source,
                transcoder: transcoder,
                profile: profile,
                deinterlace: deinterlace,
                aspectRatio: aspectRatio,
                forceX264: forceX264,
                h265: h265,
                useMpkg: useMpkg,
                priority: priority,
                sd: sd,
                monitoring: monitoring,
                dvr24: dvr24,
                liveNow: liveNow,
                featured: featured,
                moviesNow: moviesNow,
                psVOD: psVOD
            },
            $push: {
                updateHistory: {
                    date: new Date(),
                    payload: {}
                }
            }
        }
    };

    if (typeof channelEPGId === 'undefined') delete query.update.$set.channelEPGId;
    if (typeof name === 'undefined') delete query.update.$set.name;
    if (typeof descriptionShort === 'undefined') delete query.update.$set.descriptionShort;
    if (typeof descriptionLong === 'undefined') delete query.update.$set.descriptionLong;
    if (typeof notes === 'undefined') delete query.update.$set.notes;
    if (typeof enabled === 'undefined') delete query.update.$set.enabled;
    if (typeof category === 'undefined') delete query.update.$set.enabled;

    query.update.$push.updateHistory.payload = query.update.$set;

    if (typeof poster !== 'undefined' && poster[0].update === true) {
        cloudinary.uploader.upload(poster[0].url, (result) => {

            let poster = {
                url: result.url,
                type: db.Channels.poster.LANDSCAPE
            };

            query.update["$set"].poster = [poster];
        });

    } 

    try {
        const channels = await db.Channels.updateOne(query.find, query.update);

        console.log('Upd:' + JSON.stringify(channels))
        res.status(200).send(new api.Success(channels));
    } catch (error) {

        console.error(`Error in api/nx -- _update service: ${error.message}`);
        res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
            .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
    }
            
}

async function _delete(req, res) {
    let db = dc.db;

    if (db) {

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

    await db.Channels
        .remove(query.find)
        .then(() => {

            res.status(200).send(new api.Success({}));
        }).catch((error) => {

            res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
                .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
        })
}

