const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let db = {
    connected: true
};

exports.bind = function () {

    const updateHistory = new Schema({
        "date": Date,
        "type": String,
        "products": Schema.Types.Mixed
    });

    /* START Subscribers SCHEMA */
    let subscribersSchema = new Schema({
        "operator": String,
        "system": String,
        "subscriberId": {type: String, index: true}, // Id del cliente Wiltel
        "email": {type: String, unique: true},
        "products": [String], // Id tipo ObjectId de mongo que identifica el paquete o producto,
        "creationDate": Date,
        "lastUpdate": Date,
        "updateHistory": [updateHistory]
    });

    db.Subscribers = mongoose.model('subscribers', subscribersSchema);

    db.Subscribers.UpdateHistoryType = {
        Create: 'A',
        Update: 'M'
    };

    /* START Products SCHEMA */
    let productsSchema = new Schema({
        "productName": {type: String, index: true},
        "creationDate": Date,
        "lastUpdate": Date,
        "channels": [Schema.Types.ObjectId],
        "updateHistory": [{
            "date": Date,
            "products": {
                "channels": [Schema.Types.ObjectId]
            }
        }]
    });

    db.Products = mongoose.model('products', productsSchema);

    /* START Channels SCHEMA */
    let channelsSchema = new Schema({
        "name": {type: String, index: true},
        "descriptionShort": Date,
        "descriptionLong": Date,
        "publishing": [{
            "type": String, // HLS, DASH
            "url": String
        }],
        "updateHistory": [{
            "date": Date,
            "payload": Schema.Types.Mixed
        }]
    });
    
    db.Channels = mongoose.model('channels', channelsSchema);

    db.Channels.publishingType = {
        HLS: 'HLS',
        DASH: 'DASH'
    };

    return db;
};
