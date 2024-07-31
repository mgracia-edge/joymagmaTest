const path = require("path");
const fs = require('fs');
const request = require("request");
const Client = require('ftp');
const parseString = require('xml2js').parseString;
const api = require("../support");
const C = require("../codes");
const pdc = require("../../lib/dataConnection");


let ottConfig = [];

pdc.on("connected", () => {
    updateOttConfig();
    preChacheDays();
});

setInterval(updateOttConfig, 120000);
setInterval(preChacheDays, 3600000);


async function updateOttConfig() {
    if (!pdc.db) {
        return;
    }

    try {
        const dbOttConfig = await pdc.db.OttConfigurations.findOne({})
        ottConfig = dbOttConfig != null ? dbOttConfig : {};
    } catch (error) {
        console.log(`Error in ext/apps.js -- updateOttConfig function: ${error.message}`)
    }
}


exports.resourceList = [
    {
        path: "verify",
        callback: LoginWOTT,
        method: "post",
        protected: false
    },
    {
        path: "check_subscriber_credentials",
        callback: checkSubscriberCredentials,
        method: "post",
        protected: false
    },
    {
        path: "get_current_programme",
        callback: getCurrentProgramme,
        method: "post",
        protected: false
    },
    {
        path: "get_current_banner",
        callback: getCurrentBanner,
        method: "post",
        protected: false
    },
    {
        path: "get_a_week",
        callback: getAWeek,
        method: "post",
        protected: false
    },
    {
        path: "get_a_day",
        callback: getADay,
        method: "post",
        protected: false
    },
    {
        path: "get_channels",
        callback: getChannels,
        method: "post",
        protected: false
    },
    {
        path: "set_favorite",
        callback: setFavorite,
        method: "post",
        protected: false
    },
    {
        path: "get_favorites",
        callback: getFavorite,
        method: "post",
        protected: false
    },
    {
        path: "get_product_channels",
        callback: getProductChannels,
        method: "post",
        protected: false
    },
    {
        path: "get_products",
        callback: getProducts,
        method: "post",
        protected: false
    },
    {
        path: "get_subscriber_contents",
        callback: getSubscriberContents,
        method: "post",
        protected: false
    },
    {
        path: "send_logs",
        callback: sendLogs,
        method: "post",
        protected: false
    },
    {
        path: "get_ott_configurations",
        callback: getOttConfigurations,
        method: "post",
        protected: false
    },
    {
        path: "check_asset_access",
        callback: check_asset_access,
        method: "post",
        protected: false
    },
    {
        path: "get_promo_channels",
        callback: get_promo_channels,
        method: "post",
        protected: false
    }
];

/** API Interface Joy ***/

function LoginWOTT(req, res) {
    res.status(C.error.operation.OPERATION_NOT_IMPLEMENTED.httpCode).send(new
    api.Error(C.error.operation.OPERATION_NOT_IMPLEMENTED));
}

function get_promo_channels(req, res) {
    res.status(200).send([
        {
            name: "HBO NOW",
            poster: "https://play-lh.googleusercontent.com/VODqBhdZXQIkQlcv_A2nAq1gPNO7fwfDlUO3UZcgcMy6jAVx05CSU-vFuVFsr9gFUuo=w240-h480-rw",
            action: "playStore",
            appId: "com.hbo.hbonow",
            uri: "https://play.google.com/store/apps/details?id=com.wbd.stream", 
            scope: "mobile"
        },
        {
            name: "HBO NOW",
            poster: "https://play-lh.googleusercontent.com/VODqBhdZXQIkQlcv_A2nAq1gPNO7fwfDlUO3UZcgcMy6jAVx05CSU-vFuVFsr9gFUuo=w240-h480-rw",
            action: "playStore",
            appId: "com.hbo.hbonow",
            uri: "https://play.google.com/store/apps/details?id=com.wbd.stream",
            scope: "tv"
        }, {
            name: "Prime Video",
            poster: "https://play-lh.googleusercontent.com/OWpGnzHvIMGzxQ4TSiNwZKex_Nq8ZLjvKmiSiCfPO26Ncy5DFhID-v3vQ_1dWCVPqA=s360-rw",
            action: "playStore",
            appId: "com.amazon.avod.thirdpartyclient",
            uri: "https://play.google.com/store/apps/details?id=com.amazon.avod.thirdpartyclient",
            scope: "mobile"
        }, {
            name: "Netflix",
            poster: "https://res.cloudinary.com/hus16zuq6/image/upload/v1584315834/Netflix_icon.svg.jpg",
            action: "playStore",
            appId: "com.netflix.mediaclient",
            uri: "https://play.google.com/store/apps/details?id=com.netflix.mediaclient",
            scope: "mobile"
        }, {
            name: "YouTube",
            poster: "https://play-lh.googleusercontent.com/lMoItBgdPPVDJsNOVtP26EKHePkwBg-PkuY9NOrc-fumRtTFP4XhpUNk_22syN4Datc=s360-rw",
            action: "playStore",
            appId: "com.google.android.youtube",
            uri: "https://play.google.com/store/apps/details?id=com.google.android.youtube",
            scope: "mobile"
        }, {
            name: "CineAR",
            poster: "https://play-lh.googleusercontent.com/I2vjdY8vSMK02_1d1Uz0Z-GIFKmAzm1Np1hQGRQysJUJRHDM_xmTIjxBnsYB-qBdQ4c=s360-rw",
            action: "playStore",
            appId: "com.arsat.odeon.mobile",
            uri: "https://play.google.com/store/apps/details?id=com.arsat.odeon.mobile",
            scope: "mobile"
        }
    ])
}

async function checkSubscriberCredentials(req, res) {
    const db = pdc.db;
    const {email, password, cid} = req.body;

    if ((!email && !cid) || !password) {
        return res.status(C.error.operation.OPERATION_INVALID_PARAMETERS.httpCode).send(new
            api.Error(C.error.operation.OPERATION_INVALID_PARAMETERS));
    }

    if (!db) {
        return res.status(C.error.database.DISCONNECTED.httpCode).send(new
            api.Error(C.error.database.DISCONNECTED));
    }

    let query = {};

    if (cid) {
        query.cid = cid;
    } else {
        query.email = email;
    }

    try {
        const storedSubscriber = await db.Subscribers.findOne(query, {updateHistory: 0})

        if (!storedSubscriber || !storedSubscriber.password || !storedSubscriber.password === password) {
            return res.status(C.error.userRights.NON_EXISTENT_USER.httpCode).send(new
                api.Error(C.error.userRights.NON_EXISTENT_USER));
        }
        
        storedSubscriber.password = undefined;
        return res.status(200).send(new api.Success(storedSubscriber));
    } catch (error) {
        console.log(`Error in ext/apps.js -- checkSubscriberCredentials service: ${error.message}`)
        
        res.status(C.error.database.ERROR.httpCode).send(new
            api.Error(C.error.database.ERROR));
    }
}

async function getCurrentProgramme(req, res) {
    let db = pdc.db;

    if (!db) {
        return res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }

    let channelEPGId = req.body.channelEPGId;

    let query = {
        find: {
            start: {
                $lt: new Date()
            },
            stop: {
                $gte: new Date()
            },
            channelEPGId: Array.isArray(channelEPGId) ? {$in: channelEPGId} : channelEPGId
        },
        sort: {
            channelEPGId: 1,
            start: 1
        }
    };

    try {
        const programmes = await db.Programme.find(query.find).sort(query.sort)

        return res.status(200).send(programmes);
    } catch (error) {
        console.error(`Error in ext/apps.js -- getCurrentProgramme service: ${error.message}`)
        res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }

}

async function getCurrentBanner(req,res){
    let db = pdc.db;

    if (!db) {
        return res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }

    let query = {
        find: {
            start: {
                $lt: new Date()
            },
            end: {
                $gte: new Date()
            }
        }
    };

    await db.Banner
        .findOne(query.find)
        .then((channels) => {

            res.status(200).send(channels);

        }).catch((error) => {
            console.log(`Error in ext/apps.js -- getCurrentBanner service: ${error.message}`)
            res.status(500).send({
                error: 0x0010,
                error_dsc: "Error en la base de datos"
            });
        })

}

async function getAWeek(req, res) {
    let db = pdc.db;

    if (!db) {
        return res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }

    let channelEPGId = req.body.channelEPGId;

    if (!Number.isInteger(channelEPGId) && !Array.isArray(channelEPGId)) {

        res.status(400).send({
            error: 0x0022,
            error_dsc: "channelEPGId debe ser del tipo INT o [INT]"
        });

        return false
    }

    let today = new Date().setHours(0, 0, 0);
    let week = new Date(today).setDate(new Date().getDate() + 6);
    week = new Date(week).setHours(23, 59, 59);

    let query = {
        find: {
            start: {
                $lt: week,
                $gte: today
            },
            channelEPGId: Array.isArray(channelEPGId) ? {$in: channelEPGId} : channelEPGId
        },
        sort: {
            channelEPGId: 1,
            start: 1
        }
    };

    await db.Programme
        .find(query.find)
        .sort(query.sort)
        .then((programmes) => {

            res.status(200).send(programmes);

        }).catch((error) => {
            console.log(`Error in ext/apps.js -- getAWeek service: ${error.message}`)
            res.status(500).send({
                error: 0x0010,
                error_dsc: "Error en la base de datos"
            });
        })
}

let getDayCache = [];

async function getADay(req, res) {
    let db = pdc.db;
    let justChache = null;

    if(!db) {
        return res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }

    if (!res) {
        console.log(`Caching day ${req}`);
        justChache = req;
    }

    let startDate = Date.now();

    let channelEPGId = justChache !== null ? justChache : req.body.channelEPGId;

    for (let i in getDayCache) {
        let cache = getDayCache[i];
        if (cache.channelEPGId === channelEPGId) {

            if (cache.expires > Date.now()) {
                console.log("cache hit");
                res.status(200).send(cache.data);
                console.log(`Day data delivered from cache / ${Date.now() - startDate} ms`);
                return;
            } else {
                console.log("cache delete");
                getDayCache.splice(i, 1);
            }

            break;
        }
    }



    if (!Number.isInteger(channelEPGId) && !Array.isArray(channelEPGId)) {
        if (justChache === null) {
            res.status(400).send({
                error: 0x0022,
                error_dsc: "channelEPGId debe ser del tipo INT o [INT]"
            });
        }

        return false
    }

    let today = (new Date()).setHours(0, 0, 0, 0);
    today = new Date(today - ((new Date()).getTimezoneOffset() - 180) / 60 * 3600000);
    let day = new Date(today.getTime() + 24 * 3600000);

    let tail = Math.floor(24 - ((Date.now() - today.getTime()) / 3600000));
    today = new Date(today.getTime() - tail * 3600000);

    let query = {
        find: {
            start: {
                $lt: day,
                $gte: today
            },
            channelEPGId: Array.isArray(channelEPGId) ? {$in: channelEPGId} : channelEPGId
        },
        sort: {
            channelEPGId: 1,
            start: 1
        }
    };

    console.log(query);

    await db.Programme
        .find(query.find)
        .sort(query.sort)
        .lean()
        .then((dbp) => {
            console.log(`Day data fetched from db / ${Date.now() - startDate} ms`);

            let programmes = [];

            if (dbp.length !== 0) {
                let lastStop = dbp[0].stop.getTime();
                for (let i = 1; i < dbp.length; i++) {

                    if (lastStop > dbp[i].start.getTime()) {
                        continue;
                    }

                    programmes.push(dbp[i]);
                    lastStop = dbp[i].stop.getTime();
                }
            }

            let check = 0;
            for (let i in programmes) {

                let p = programmes[i];

                p.deltaStart = Math.round((p.start.getTime() - today) / 60000);
                p.deltaStop = Math.round((p.stop.getTime() - today) / 60000);

                if (i == 0) {

                    if (p.deltaStart > 0) {
                        p.deltaStart = 0;
                    }
                }

                if (i == (programmes.length - 1)) {
                    p.deltaStop = (24 + tail) * 60;
                }

                p.last = p.deltaStop - p.deltaStart;

                check += p.last
            }


            if (programmes.length === 0) {
                let delta = (day.getTime() - today.getTime()) / 3600000;

                for (let i = 0; i < delta; i++) {

                    programmes.push({
                        "_id": "",
                        "start": new Date(today.getTime() + 3600000 * i),
                        "stop": new Date(today.getTime() + 3600000 * (i + 1)),
                        "title": "No hay información.",
                        "description": "No hay información relacionada con este programa.",
                        "channelEPGId": 0,
                        "deltaStart": 60 * i,
                        "deltaStop": 60 * (i + 1),
                        "last": 60
                    })

                }
            }

            getDayCache.push({
                channelEPGId: channelEPGId,
                expires: Date.now() + 3600000,
                data: programmes
            });

            if (justChache === null) {
                res.status(200).send(programmes);
            }

            console.log(`Day data fetched processed / ${Date.now() - startDate} ms`);

        }).catch((error) => {
            console.error(`Error in ext/apps.js -- getADay service: ${error.message}`);

            if (justChache === null) {
                res.status(500).send({
                    error: 0x0010,
                    error_dsc: "Error en la base de datos"
                });
            }
        })
}

async function getChannels(req, res) {
    let db = pdc.db;

    if (!db) {
        return res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }

    let channelId = req.body.id;

    let query = {};

    if (req.body.streamKey) {

        query = {
            find: {
                "entryPoint.streamKey": req.body.streamKey,
                enabled: true
            },
            sort: {
                priority: -1,
                name: 1
            }
        }

    } else if (!Number.isInteger(channelId) && !Array.isArray(channelId)) {

        query = {
            find: {},
            sort: {
                priority: -1,
                name: 1
            }
        };

    } else {
        query = {
            find: {
                _id: Array.isArray(channelId) ? {$in: channelId} : channelId
            },
            sort: {
                priority: -1,
                name: 1
            }
        };
    }

    query.projection = {
            updateHistory: 0,
            source: 0,
            monitoring: 0,
            notes: 0,
            __v: 0,
            transcoder: 0,
            useMpkg: 0,
            deinterlace: 0
        };

    await db.Channels
        .find(query.find, query.projection)
        .sort(query.sort)
        .then((channels) => {

            res.status(200).send(channels);

        }).catch((error) => {
            console.log(`Error in ext/apps.js -- getChannels service: ${error.message}`)
            res.status(500).send({
                error: 0x0010,
                error_dsc: "Error en la base de datos"
            });
    })
}

async function getProductChannels(req, res) {
    let db = pdc.db;

    if (!db) {
        return res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }

    let productId = req.body.id;

    if (!productId && !Array.isArray(productId)) {

        res.status(400).send({
            error: 0x0022,
            error_dsc: "productId debe ser del tipo INT o [INT]"
        });

        return false;
    } 

    try {
        const product = await db.Products.findOne({ _id: productId })

        if (product === null) {
            return res.send([]);
        }

        const channels = await db.Channels.find({
            _id: {
                $in: product.channels
            },
            enabled: true
        })

        if (!channels) {
            return res.send([]);
        }

        return res.send(channels)
    } catch (error) {
        console.error(`Error in ext/apps.js -- getProductChannels service: ${error.message}`);
        res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }
}

async function getSubscriberContents(req, res) {

    let db = pdc.db;

    let { subscriberId } = req.body;

    if (!db) {
        return res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }

    try {
        const subscriber = await db.Subscribers.findOne({_id: subscriberId});

        if (!subscriber) {
            return res.status(500).send({
                error: 0x0010,
                error_dsc: "Error en la base de datos"
            });
        }

        let categories = [];
        let channels = [];
        let productsQueries = [];

        for (let product of subscriber.products) {
            productsQueries.push(await getChannelsFor(product))
        }

        Promise.all(productsQueries).then(async (products) => {

            for (let product of products) {
                for (let channelId of product.channels) {
                    channels[channelId] = 1
                }
            }

            let channelsQueries = [];

            for (let channelId in channels) {
                channelsQueries.push(await getChannel(channelId));
            }

            Promise.all(channelsQueries).then(async (channels) => {

                channels.sort((a, b) => {
                    let p1 = a && a.priority ? a.priority : 100;
                    let p2 = b && b.priority ? b.priority : 100;
                    return p1 - p2;
                });

                for (let channel of channels) {


                    if (!channel || !channel.enabled) continue;


                    if (categories[channel.category]) {
                        categories[channel.category].push(channel)
                    } else {
                        categories[channel.category] = [channel]
                    }
                }
            });
            
        })
        
        await renderResponse(categories)
    } catch (error) {
        console.log(`Error in ext/apps.js -- getSubscriberContents service: ${error.message}`)
        console.error(`Error in ext/apps.js -- getSubscriberContents service: ${error.message}`);
        res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }



    async function renderResponse(categories) {
        try {
            const catData = await db.Category.find({});
            let response = [];
    
            for (let cid in categories) {

                let data = null;

                for (let cat of catData) {
                    if (cat._id.toString() === cid) {
                        data = cat;
                    }
                }

                response.push({
                    name: data !== null ? data.name : "",
                    descriptionShort: data !== null ? data.descriptionShort : "",
                    priority: data.priority,
                    categoryId: cid,
                    channels: categories[cid]
                })
            }

            response.sort((a,b)=>{
                return a.priority - b.priority;
            })

            console.log(response)

            res.status(200).send(response);
        } catch (error) {
            console.error(`renderResponse helper error: ${error.message}`);
            res.status(500).send({
                error: 0x0010,
                error_dsc: "Error en la base de datos"
            });
        }
    }


    async function getChannelsFor(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const product = await db.Products.findOne({_id: id}, {updateHistory: 0});
                
                resolve(product)
            } catch (error) {
                console.error(`getChannelsFor helper error: ${error.message}`);
                reject({
                    message: "Error en la base de datos"
                });   
            }
        })
    }

    async function getChannel(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const channel = await db.Channels.findOne({_id: id}, {updateHistory: 0});

                resolve(channel)
            } catch (error) {
                console.error(`getChannel helper error: ${error.message}`);
                reject({
                    message: "Error en la base de datos"
                });
            }
        })
    }
}

async function getOttConfigurations(req, res) {
    let db = pdc.db;

    if (!db) {
        return res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        }); 
    }

    let query = {
        find: {}
    };

    await db.OttConfigurations
        .findOne(query.find)
        .then((ottConfigurations) => {
            res.status(200).send(ottConfigurations);
        }).catch((error) => {
            console.error(`Error in ext/apps.js -- getOttConfigurations service: ${error.message}`)
            res.status(500).send({
                error: 0x0010,
                error_dsc: "Error en la base de datos"
            });
        })
}

async function getProducts(req, res) {
    let db = pdc.db;

    if (!db) {
        return res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }

    let productId = req.body.id;

    if (!productId && !Array.isArray(productId)) {

        res.status(400).send({
            error: 0x0022,
            error_dsc: "productId debe ser del tipo INT o [INT]"
        });

        return false;
    }

    let query = {
        find: {
            _id: Array.isArray(productId) ? {$in: productId} : productId
        },
        sort: {
            productName: 1
        }
    };

    await db.Products
        .find(query.find)
        .sort(query.sort)
        .then((products) => {

            if (Array.isArray(productId)) {
                res.status(200).send(products);
            } else {
                res.status(200).send(products[0]);
            }

        }).catch((error) => {
            console.log(`Error in ext/apps.js -- getProducts service: ${error.message}`)
            res.status(500).send({
                error: 0x0010,
                error_dsc: "Error en la base de datos"
            });
        })
}

async function setFavorite(req, res) {
    let db = pdc.db;

    if (!db) {
        return res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }

    // TODO VEr esto https://stackoverflow.com/questions/41788688/mongo-schema-array-of-string-with-unique-values,
    // parece ser una mejor forma
    let {subscriberId, channelId, favorite} = req.body;

    try {
        let newVector = [];

        if (favorite) {
            newVector.push(channelId);
        }

        const subscriber = await db.Subscribers.findOneAndUpdate({_id: subscriberId}, {$addToSet:  {favoriteChannels: newVector}});

        if (!subscriber) {
            return res.status(400).send({
                error: 0x0020,
                error_dsc: "User, not found"
            });
        }

        res.status(200).send({
            error: null
        });
    } catch (error) {
        console.error(`Error in ext/apps.js -- setFavorite service: ${error.message}`);
        res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }
}

async function getFavorite(req, res) {
    let db = pdc.db;

    if (!db) {
        console.error(`Error in ext/apps.js -- getFavorite service: ${error.message}`);
        return res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    } 

    let {subscriberId, channelId, favorite} = req.body;

    try {
        const subscriber = await db.Subscribers.findOne({_id: subscriberId});
        
        if (!subscriber) {
            return res.status(400).send({
                error: 0x0020,
                error_dsc: "User, not found"
            });
        }

        const channels = await db.Channels.find({ _id: { $in: subscriber.favoriteChannels } }, { updateHistory: 0 });

        res.send(channels);
    } catch (error) {
        console.error(`Error in ext/apps.js -- getFavorite service: ${error.message}`);
        res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }
}

async function sendLogs(req, res) {
    let db = pdc.db;

    if (!db) {
        return res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }

    let opt = {
        subscriberId: req.body.id,
        agent: req.body.agent,
        status: req.body.status,
        session: req.body.session,
        channelId: req.body.channelId,
        programmeId: req.body.programmeId,
        dvrPosition: req.body.dvrPosition,
        date: new Date()
    };

    try {
        await db.StatsLines.create(opt)

        res.status(200).send({});
    } catch (error) {
        console.error(`Error in ext/apps.js -- sendLogs service: ${error.message}`);

        res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }
}

async function check_asset_access(req, res) {
    let db = pdc.db;

    if (!db) {
        return res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }

    let {subscriberId} = req.body;
    let screens = ottConfig.screens;


    try {
        const sessions = await db.StatsLines.find({
            "status": "playing",
            "date": {
                $gt: new Date(Date.now() - 10000)
            },
            "subscriberId": subscriberId
        });

        let sessionsIndex = [];
        let nSessions = 0;

        for (let session of sessions) {

            if (session.session === req.body.sessionId) {
                break;
            }

            if (sessionsIndex[session.session]) {
            } else {
                nSessions++;
                sessionsIndex[session.session] = 1;
            }
        }

        if (nSessions >= screens) {
            res.status(200).send({
                canPlay: false
            });
        } else {
            res.status(200).send({
                canPlay: true
            });
        }

    } catch (error) {
        console.error(`Error in ext/apps.js -- check_asset_access service: ${error.message}`);
        res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }

}


async function preChacheDays() {
    if (!pdc.db) {
        return;
    }

    try {
        const data = await pdc.db.Channels.find({enabled: true});

        for (let i in data) {
            getADay(parseInt(data[i].channelEPGId));
        }
    } catch (error) {
        console.log(`Error in ext/apps.js -- preCacheDays function: ${error.message}`)
    }
}