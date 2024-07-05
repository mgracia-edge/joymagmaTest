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

function _create(req, res) {
    let db = dc.db;

    // if (db) {

    //     if (!req.user.permissions.includes(codes.users_permissions.BANNERS_WRITE)) {

    //         res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
    //             .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

    //         return;
    //     }

    //     const {name, poster} = req.body;

    //     db.Banner
    //         .findOne({"name": name}, (error, data) => {
    //             if (error) {
    //                 res.status(codes.error.database.DISCONNECTED.httpCode)
    //                     .send(new api.Error(codes.error.database.DISCONNECTED));
    //             } else {
    //                 if (data) {
    //                     res.status(codes.error.operation.DUPLICATED_ENTITY.httpCode)
    //                         .send(new api.Error(codes.error.operation.DUPLICATED_ENTITY));
    //                 } else {

    //                     db.Banner.findOne({
    //                         start: {$lte: end},
    //                         end: {$gte: start}
    //                       }, (error, data) => {
    //                         if (error) {
    //                           res.status(codes.error.database.DISCONNECTED.httpCode).send(new api.Error(codes.error.database.DISCONNECTED));
    //                         } else if (data) {
    //                           res.status(codes.error.operation.OVERLAPPING_BANNER.httpCode).send(new api.Error(codes.error.operation.OVERLAPPING_BANNER));
    //                         } else {
    //                             let json = {
    //                                 name: name,
    //                                 start: start,
    //                                 end: end,
    //                                 duration: duration
    //                             };

    //                             json.updateHistory = [{
    //                                 date: new Date(),
    //                                 payload: {
    //                                     ...json
    //                                 }
    //                             }];

    //                             if (typeof poster !== 'undefined' && poster[0].update && poster[0].update === true) {
    //                                 cloudinary.uploader.upload(poster[0].url, (result) => {

    //                                     let poster = {
    //                                         url: result.url,
    //                                         type: db.Channels.poster.LANDSCAPE
    //                                     };

    //                                     json.poster = [poster];

    //                                     _create();
    //                                 });

    //                             } else {
    //                                 _create()
    //                             }
    //                             _create();

    //                             function _create() {
    //                                 let banner = new db.Banner(json);

    //                                 banner.save(json, (err) => {
    //                                     if (err) {
    //                                         console.log(err)
    //                                         res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
    //                                             .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
    //                                     } else {
    //                                         res.status(200).send(new api.Success({}));

    //                                     }

    //                                 });
    //                             }
    //                         }
    //                     })
    //                 }
    //             }
    //         });


    // } else {

    //     res.status(codes.error.database.DISCONNECTED.httpCode)
    //         .send(new api.Error(codes.error.database.DISCONNECTED));
    // }
}

async function _read(req, res) {
    let db = dc.db;
    
    if (!db) {
        return res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }

    if (!req.user.permissions.includes(codes.users_permissions.BANNERS_READ)) {
        res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
            .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));
        return;
    }

    let {id, data} = req.body;
    
    let query = {
        find: {},
    }
    

    // if (id) {
    //     query.find = {_id: Array.isArray(id) ? {$in: id} : id}

    // } else if (data) {
    //     query.find = {}
    // }

    // if (typeof includeUpdateHistory !== "undefined" && includeUpdateHistory) {
    //     delete query.projection.updateHistory;
    // }

    await db.EventSport
        .find(query.find, {})
        .sort(query.sort)
        .then((events) => {
            
            res.status(200).send(new api.Success(events));
        }).catch((error) => {
            console.error(`Error in api/nx/eventSport.js -- _read service: ${error.message}`)
            res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
                .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
        })        

}

async function _update(req, res) {
    let db = dc.db;

    if (db) {

        return res.status(codes.error.operation.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }

    if (!req.user.permissions.includes(codes.users_permissions.BANNERS_WRITE)) {

        res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
            .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));

        return;
    }

    const {id,data} = req.body
    const {deportName,deportGroupName} = data
    let query = {}
    
    query = {
        find: {
            _id: id
        },
        update: {
            $set: {
                deportName: deportName,
                deportGroupName: deportGroupName

            }
        }
    };

    try {
        const eventSport = await db.EventSport.updateOne(query.find, query.update);
        
        res.status(200).send(new api.Success(eventSport));
    } catch (error) {
        console.error(`Error in api/nx/eventSport.js -- _update service: ${error.message}`)
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

    if (!req.user.permissions.includes(codes.users_permissions.BANNERS_WRITE)) {

        return res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
            .send(new api.Error(codes.error.userRights.PERMISSION_DENIED));
    }

    const {id} = req.body;

    let query = {
        find: {
            _id: Array.isArray(id) ? {$in: id} : id
        }
    };

    await db.BannerVOD
        .find(query.find, query.projection)
        .sort(query.sort)
        .then((banners) => {

            res.status(200).send(new api.Success(banners));
        }).catch(() => {
            res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
                .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
        })        
        
        // db.Banner
        //     .remove(query.find)
        //     .then((data) => {

        //         res.status(200).send(new api.Success({}));

        //     }).catch((error) => {

        //     res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
        //         .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
        // })
}
