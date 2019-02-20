const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let db = {
    connected: true
};

exports.bind = function () {

    /* START USER SCHEMA */
    let userSchema = new Schema({
        "email": {type: String, index: true, unique: true},
        "firstName": String,
        "lastName": String,
        "facebook": {
            id: {type: String, unique: true}
        },
        "google": {
            id: {type: String, unique: true}
        },
        "session": {
            password: String,
            browserKeys: [String]
        },
        "verified": {type: Boolean, default: false},
        "verificationCode": String,
        "billing": {
            "subscription": {
                id: Schema.Types.ObjectId,
                renewDate: Date
            },
            "payPerView": [{
                categoryId: Schema.Types.ObjectId,
                paymentDate: Date,
                paymentId: String
            }]
        },
        "paypalId": {type: String, unique: true},
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
        }
    });
    db.User = mongoose.model('users', userSchema);


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
        "productId": {type: String, index: true},
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
        "channelEPGId": {type: String, index: true},
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

    /* START Programme SCHEMA */
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
