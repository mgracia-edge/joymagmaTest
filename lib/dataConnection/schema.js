const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let db = {
    connected: true
};

exports.bind = function () {

    /* Nx Studio */

    /* Users Schema */
    let sessionSchema = new Schema({
        date: Date,
        expires: Date,
        lastAccess: Date,
        ip: String,
        token: {type: String, index: true}
    });

    let userSchema = new Schema({
        "email": {type: String, index: true, unique: true},
        "firstName": String,
        "lastName": String,
        "authentication": {
            password: String,
            sessions: [sessionSchema]
        },
        "photo":{
            "url":String
        },
        "creation": {
            "date": {type: Date, default: Date.now},
            "ip": String,
            "location": {
                "countryCode": String,
                "city": String
            },
            "device": {
                mobile: Boolean,
                osName: String,
                osVersion: String,
                browserName: String,
                browserVersion: String
            }
        },
        "permissions": [String]
    });
    db.User = mongoose.model('users', userSchema);

    /* Account Schema */
    let accountSchema = new Schema({
        "name": String,
        "description": String,
        "services": [String],
        "logo": {
            "url": String
        },
        "contact": {
            "technical": {
                "name": String,
                "email": String,
                "phone": String
            },
            "commercial": {
                "name": String,
                "email": String,
                "phone": String
            }
        }

    });
    db.Account = mongoose.model('accounts', accountSchema);


    /* Wiltel */

    const updateHistory = new Schema({
        "date": Date,
        "type": String,
        "products": Schema.Types.Mixed
    });

    /* Subscribers SCHEMA */

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

    /* Products SCHEMA */

    const updateHistoryProducts = new Schema({
        "date": Date,
        "products": {
            "channels": [Schema.Types.ObjectId]
        }
    });

    let productsSchema = new Schema({
        "productId": {type: String, index: true},
        "name": {type: String, index: true},
        "creationDate": Date,
        "lastUpdate": Date,
        "channels": [Schema.Types.ObjectId],
        "updateHistory": [updateHistoryProducts]
    });

    db.Products = mongoose.model('products', productsSchema);

    /* Channels SCHEMA */

    const publishing = new Schema({
        "type": String, // HLS, DASH
        "url": String
    });

    const updateHistoryChannels = new Schema({
        "date": Date,
        "payload": Schema.Types.Mixed
    });

    let channelsSchema = new Schema({
        "channelEPGId": {type: String, index: true},
        "name": {type: String, index: true},
        "descriptionShort": String,
        "descriptionLong": String,
        "publishing": [publishing],
        "updateHistory": [updateHistoryChannels]
    });

    db.Channels = mongoose.model('channels', channelsSchema);

    db.Channels.publishingType = {
        HLS: 'HLS',
        DASH: 'DASH'
    };

    /* Programme SCHEMA */
    let programmeSchema = new Schema({
        "start": {type: Date, index: true},
        "stop": {type: Date, index: true},
        "title": {type: String, index: true},
        "description": String,
        "credits": {type: String, index: true},
        "category": Number,
        "subCategory": Number,
        "parentalCode": Number,
        "channelEPGId": {type: Number, index: true}
    });

    db.Programme = mongoose.model('programme', programmeSchema);

    return db;
};
