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
        "cid": String,
        "name": String,
        "password": {type: String}, // Id del cliente Wiltel
        "email": {type: String, unique: true},
        "products": [String], // Id tipo ObjectId de mongo que identifica el paquete o producto,
        "creationDate": Date,
        "lastUpdate": Date,
        "lastLogin": Date,
        "updateHistory": [updateHistory],
        "favoriteChannels": [Schema.Types.ObjectId]
    });

    db.Subscribers = mongoose.model('subscribers', subscribersSchema);
    db.Subscriber = mongoose.model('subscribers', subscribersSchema);

    db.Subscribers.UpdateHistoryType = {
        Create: 'A',
        Update: 'M',
        Baja: 'B'
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
        "notes": String,
        "channels": [Schema.Types.ObjectId],
        "updateHistory": [updateHistoryProducts]
    });

    db.Products = mongoose.model('products', productsSchema);

    /* Channels SCHEMA */

    const publishingEntitySchema = new Schema({
        "type": String, // HLS, DASH
        "streamName": String // Hash tipo StreamKey
    });

    const updateHistoryChannelsSchema = new Schema({
        "date": Date,
        "payload": Schema.Types.Mixed
    });

    const entryPointSchema = new Schema({
        "type": String, // RTMP
        "streamKey": String // Hash tipo StreamKey
    });

    const posterSchema = new Schema({
        "type": String, // RTMP
        "url": String // Hash tipo StreamKey
    });

    /*
    Presets for CPU:
        ultrafast superfast veryfast faster fast medium  slow slower veryslow

    Presets for GPU:
        default slow medium fast hp hq bd ll llhq llhp lossless losslesshp
     */
    const profileSchema = {
        "engine": String, // CPU, GPU
        "preset": String,
        "profile": String, // baseline, main, high, high444p
        "level": String // valid h264 level
    };

    const sourceSchema = {
        "type": {type: String, index: true}, // RTMP_PUSH, MULTICAST_PULL, UNICAST_PULL, RTMP_PULL, HLS_PULL, HLS_URI,
        "entrypointId": {type: String, index: true}, // Name of the entrypoint
        "url": String,
        "ip": String,
        "port": Number,
        "videoPkgId": String,
        "audioPkgId": String,
        "udpQuery": String
    };

    let channelsSchema = new Schema({
        "source": sourceSchema,
        "channelEPGId": {type: String, index: true},
        "name": {type: String, index: true},
        "enabled": {type: Boolean, default: false},
        "descriptionShort": String,
        "descriptionLong": String,
        "category": Schema.Types.ObjectId,
        "entryPoint": entryPointSchema,
        "transcoder": String,
        "profile": profileSchema,
        "publishing": [publishingEntitySchema],
        "poster": [posterSchema],
        "notes": String,
        "updateHistory": [updateHistoryChannelsSchema],
        "deinterlace": Boolean,
        "forceX264": Boolean,
        "useMpkg": Boolean,
        "h265": Boolean,
        "sd": Boolean,
        "aspectRatio": String,
        "priority": {type: Number, default: 100},
        "dvr24": Boolean,
        "monitoring": {
            "priority": {type: Number, default: 100}
        },
        "liveNow": Boolean,
        "featured": Boolean,
        "cineNow": Boolean
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
        "width": Number,
        "height": Number,
        "audioBitrate": Number,
        "videoBitrate": Number
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
        "quality": [qualityAvProfile]
    });

    db.AvProfile = mongoose.model('avProfile', AvProfile);

    db.AvProfile.codec = {
        GPU: 'GPU',
        CPU: 'CPU'
    };

    /* Category SCHEMA */

    const updateHistoryCategories = new Schema({
        "date": Date,
        "type": String,
        "payload": Schema.Types.Mixed
    });

    let CategorySchema = new Schema({
        "name": {type: String, index: true},
        "descriptionShort": String,
        "descriptionLong": String,
        "priority": Number,
        "updateHistory": [updateHistoryCategories]
    });

    db.Category = mongoose.model('categories', CategorySchema);

    /* Banner Schema */
    const updateHistoryBanner = new Schema({
        "date": Date,
        "type": String,
        "payload": Schema.Types.Mixed
    });

    let BannerSchema = new Schema({
        "name": {type: String, index: true},
        "duration": Number,
        "start": {type: Date, index: true},
        "end": {type: Date, index: true},
        "poster": [posterSchema],
        "updateHistory": [updateHistoryCategories]
    });

    db.Banner = mongoose.model('banners', BannerSchema);

    /* OTT Config Schema */

    let OttConfigurationsSchema = new Schema({
        "keepWatchingWarning": Number,
        "screens": Number
    });

    db.OttConfigurations = mongoose.model('ottConfigurations', OttConfigurationsSchema);

    /* Stats Lines */

    let StatsLines = new Schema({
        subscriberId: {type: Schema.Types.ObjectId, index: true},
        date: {type: Date, index: true},
        agent: {type: String, index: true},
        status: {type: String, index: true},
        session: {type: String, index: true},
        channelId: {type: String, index: true},
        programmeId: {type: String, index: true},
        dvrPosition: Number
    });

    db.StatsLines = mongoose.model('statsLines', StatsLines);

    /* Stats Daily Resume */

    let StatsDailyInstalls = new Schema({
        date: {type: Date, index: true},
        installs: {
            total: Number,
            operators: [String],
            operatorsDistribution: [Number]
        },
        uninstalls: {
            total: Number,
            operators: [String],
            operatorsDistribution: [Number]
        },
        active: {
            total: Number,
            operators: [String],
            operatorsDistribution: [Number]
        }
    });
    db.StatsDailyInstalls = mongoose.model('statsDailyInstalls', StatsDailyInstalls);

    /* Stats Daily Resume */

    let StatsPlayingResume = new Schema({
        subscribers: [Schema.Types.ObjectId],
        channels: [{id: Schema.Types.ObjectId, playingTime: Number}],
        operators: [{id: Schema.Types.ObjectId, playingTime: Number}],
        date: {type: Date, index: true},
        avgPerSub: {
            playingTime: Number,
            channels: Number,
            screens: Number,
            device: Number
        },
        peaks: {
            playingTime: Number,
            concurrency: Number,
            uniqueUsers: Number
        },
        devices: {
            ios: Number,
            android: Number,
            androidTv: Number,
            browser: Number
        }
    });

    db.StatsDailyPlayingResume = mongoose.model('statsDailyPlayingResumes', StatsPlayingResume);

    /* Stats Daily Resume */

    let StatsResume = new Schema({
        date: {type: Date, index: true},
        aggregation: {type: String, index: true},
        device: {type: String, index: true},
        concurrency: Number,
        playTime: Number,
        numberOfSubscribers: Number,
        perChannel: [
            {
                channelId: Schema.Types.ObjectId,
                concurrency: Number,
                playTime: Number
            }
        ],
        sessions: [String]
    });

    db.StatsResume = mongoose.model('StatsResume', StatsResume);

    /* Stats Daily Resume */

    let StatsDailySubscribers = new Schema({
        fromDate: {type: Date, index: true},
        untilDate: {type: Date},
        active: Number,
        installs: Number,
        uninstalls: Number,
        difference: Number,
    });
    db.StatsDailySubscribers = mongoose.model('statsDailySubscribers', StatsDailySubscribers);    

    return db;

};
