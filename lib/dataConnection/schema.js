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
        "photo": {
            "url": String
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
        "account": Schema.Types.ObjectId,
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
        "name": {type: String, index: true, unique: true},
        "description": String,
        "creationDate": Date,
        "lastUpdate": Date,
        "channels": [Schema.Types.ObjectId],
        "updateHistory": [updateHistoryProducts]
    });

    db.Products = mongoose.model('products', productsSchema);

    /* Channels SCHEMA */

    const publishingEntity = new Schema({
        "type": String, // HLS, DASH
        "streamName": String // Hash tipo StreamKey
    });

    const updateHistoryChannels = new Schema({
        "date": Date,
        "payload": Schema.Types.Mixed
    });

    const entryPoint = new Schema({
        "type": String, // RTMP
        "streamKey": String // Hash tipo StreamKey
    });

    const poster = new Schema({
        "type": String, // RTMP
        "url": String // Hash tipo StreamKey
    });

    let channelsSchema = new Schema({
        "channelEPGId": {type: String, index: true},
        "name": {type: String, index: true},
        "descriptionShort": String,
        "descriptionLong": String,
        "entryPoint": entryPoint,
        "publishing": [publishingEntity],
        "poster": [poster],
        "updateHistory": [updateHistoryChannels]
    });

    db.Channels = mongoose.model('channels', channelsSchema);

    db.Channels.publishingType = {
        HLS: 'HLS',
        DASH: 'DASH'
    };

    db.Channels.entryPoint = {
        RTMP: 'RTMP'
    };

    db.Channels.poster = {
        ANDROID_TV: 'ANDROID_TV',
        PORTRAIT: 'PORTRAIT',
        LANDSCAPE: 'LANDSCAPE'
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

    const qualityAvProfile = new Schema({
        "width":Number,
        "height":Number,
        "audioBitrate":Number,
        "videoBitrate":Number
    });

    /* AvProfile SCHEMA */
    let AvProfile = new Schema({
        "name": {type: String, index: true},
        "description": String,
        "chunkSize": Number,
        "fps": Number,
        "keyRate": Number,
        "dvr": Boolean,
        "aesEncryption": Boolean,
        "profile": String, // Baseline , Mainline, High
        "codec": String, // GPU , CPU,
        "quality":[qualityAvProfile]
    });

    db.AvProfile = mongoose.model('avProfile', AvProfile);

    db.AvProfile.codec = {
        GPU: 'GPU',
        CPU: 'CPU'
    };

    return db;

};
