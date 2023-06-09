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

setInterval(updateOttConfig, 60000);
setInterval(preChacheDays, 1800000);


function updateOttConfig() {
    let db = pdc.db;

    if (db) {
        db.OttConfigurations.findOne({}, (error, dbOttConfig) => {
            ottConfig = dbOttConfig != null ? dbOttConfig : {};
        })
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
    res.send([
        {
            name: "HBO NOW",
            poster: "https://play-lh.googleusercontent.com/GmIOtlRHzTffK3WSyNrz4NNrWFh_yUuhQb9UHXztk0ZxeeFzAUD52b9YVTGh7nsdJ8c=s360-rw",
            action: "playStore",
            appId: "com.hbo.hbonow",
            uri: "https://play.google.com/store/apps/details?id=com.hbo.hbonow",
            scope: "mobile"
        },
        {
            name: "HBO NOW",
            poster: "https://play-lh.googleusercontent.com/GmIOtlRHzTffK3WSyNrz4NNrWFh_yUuhQb9UHXztk0ZxeeFzAUD52b9YVTGh7nsdJ8c=s360-rw",
            action: "playStore",
            appId: "com.hbo.hbonow",
            uri: "https://play.google.com/store/apps/details?id=com.hbo.hbonow",
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

function checkSubscriberCredentials(req, res) {

    const {email, password, cid} = req.body;

    console.log((!!email || !!cid) && password)

    if ((!!email || !!cid) && password) {

        let query = {};

        if (cid) {
            query.cid = cid;
        } else {
            query.email = email;
        }

        let db = pdc.db;

        if (db) {

            db.Subscribers.findOne(query, function (error, storedSubscriber) {

                if (storedSubscriber && storedSubscriber.password && storedSubscriber.password === password) {
                    res.status(200).send(new api.Success(storedSubscriber));
                } else if (error) {
                    res.status(C.error.database.ERROR.httpCode).send(new
                    api.Error(C.error.database.ERROR));
                } else {
                    res.status(C.error.userRights.NON_EXISTENT_USER.httpCode).send(new
                    api.Error(C.error.userRights.NON_EXISTENT_USER));
                }
            })

        } else {
            res.status(C.error.database.DISCONNECTED.httpCode).send(new
            api.Error(C.error.database.DISCONNECTED));
        }

    } else {
        res.status(C.error.operation.OPERATION_INVALID_PARAMETERS.httpCode).send(new
        api.Error(C.error.operation.OPERATION_INVALID_PARAMETERS));
    }
}

function getCurrentProgramme(req, res) {

    let db = pdc.db;

    if (db) {

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

        db.Programme
            .find(query.find)
            .sort(query.sort)
            .then((programmes) => {

                res.status(200).send(programmes);

            }).catch((error) => {
            res.status(500).send({
                error: 0x0010,
                error_dsc: "Error en la base de datos"
            });
        })

    } else {

        res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });

    }

}

function getCurrentBanner(req,res){
    let db = pdc.db;

    if (db) {

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

        db.Banner
            .findOne(query.find)
            .then((channels) => {

                res.status(200).send(channels);

            }).catch((error) => {
            res.status(500).send({
                error: 0x0010,
                error_dsc: "Error en la base de datos"
            });
        })

    } else {

        res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });

    }
}

function getAWeek(req, res) {

    let db = pdc.db;

    if (db) {

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

        db.Programme
            .find(query.find)
            .sort(query.sort)
            .then((programmes) => {

                res.status(200).send(programmes);

            }).catch((error) => {
            res.status(500).send({
                error: 0x0010,
                error_dsc: "Error en la base de datos"
            });
        })

    } else {

        res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });

    }
}

let getDayCache = [];

function getADay(req, res) {
    let startDate = Date.now();
    let justChache = null;

    if (!res) {
        console.log(`Caching day ${req}`);
        justChache = req;
    }

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

    let db = pdc.db;

    if (db) {

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

        db.Programme
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
            console.error(error);

            if (justChache === null) {
                res.status(500).send({
                    error: 0x0010,
                    error_dsc: "Error en la base de datos"
                });
            }

        })

    } else {

        res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });

    }
}

function getChannels(req, res) {

    let db = pdc.db;

    if (db) {

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


        db.Channels
            .find(query.find)
            .sort(query.sort)
            .then((channels) => {

                res.status(200).send(channels);

            }).catch((error) => {
            res.status(500).send({
                error: 0x0010,
                error_dsc: "Error en la base de datos"
            });
        })

    } else {

        res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });

    }
}

function getProductChannels(req, res) {
    let db = pdc.db;

    let productId = req.body.id;

    if (db) {

        if (!productId && !Array.isArray(productId)) {

            res.status(400).send({
                error: 0x0022,
                error_dsc: "productId debe ser del tipo INT o [INT]"
            });

            return false
        } else {

            db.Products.findOne({
                _id: productId
            }, function (error, product) {
                if (error) {
                    console.error(error);
                    res.status(500).send({
                        error: 0x0010,
                        error_dsc: "Error en la base de datos"
                    });
                } else {
                    if (product === null) {
                        res.send([]);
                    } else {
                        db.Channels.find({
                            _id: {
                                $in: product.channels
                            },
                            enabled: true
                        }, function (error, channels) {
                            if (channels) {
                                res.send(channels)
                            } else {
                                res.send([]);
                            }
                        })

                    }
                }
            })

        }

    } else {

        res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });

    }
}

function getSubscriberContents(req, res) {

    let db = pdc.db;

    let {subscriberId} = req.body;

    if (db) {
        db.Subscribers.findOne({_id: subscriberId}, (error, subscriber) => {

            if (subscriber) {
                let categories = [];
                let channels = [];
                let productsQueries = [];

                for (let product of subscriber.products) {
                    productsQueries.push(getChannelsFor(product))
                }

                Promise.all(productsQueries).then((products) => {

                    for (let product of products) {
                        for (let channelId of product.channels) {
                            channels[channelId] = 1
                        }
                    }

                    let channelsQueries = [];

                    for (let channelId in channels) {
                        channelsQueries.push(getChannel(channelId));
                    }

                    Promise.all(channelsQueries).then((channels) => {

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

                        renderResponse(categories)

                    });

                })
            } else {
                res.status(500).send({
                    error: 0x0010,
                    error_dsc: "Error en la base de datos"
                });
            }


        });
    } else {
        res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }


    function renderResponse(categories) {

        db.Category.find({}, function (error, catData) {
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

        });


    }


    function getChannelsFor(id) {
        return new Promise(resolve => {
            db.Products.findOne({_id: id}, {updateHistory: 0}, function (error, product) {
                resolve(product)
            })
        })
    }

    function getChannel(id) {
        return new Promise(resolve => {
            db.Channels.findOne({_id: id}, {updateHistory: 0}, function (error, channel) {
                resolve(channel)
            })
        })
    }
}

function getOttConfigurations(req, res) {


    let db = pdc.db;

    if (db) {

        let query = {
            find: {}
        };

        db.OttConfigurations
            .findOne(query.find)
            .then((ottConfigurations) => {
                res.status(200).send(ottConfigurations);
            }).catch((error) => {

            res.status(500).send({
                error: 0x0010,
                error_dsc: "Error en la base de datos"
            });
        })

    } else {


        res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });

    }
}

function getProducts(req, res) {


    let db = pdc.db;

    if (db) {

        let productId = req.body.id;

        console.log(req.body)

        if (!productId && !Array.isArray(productId)) {

            res.status(400).send({
                error: 0x0022,
                error_dsc: "productId debe ser del tipo INT o [INT]"
            });

            return false
        }

        let query = {
            find: {
                _id: Array.isArray(productId) ? {$in: productId} : productId
            },
            sort: {
                productName: 1
            }
        };

        db.Products
            .find(query.find)
            .sort(query.sort)
            .then((products) => {

                if (Array.isArray(productId)) {
                    res.status(200).send(products);
                } else {
                    res.status(200).send(products[0]);
                }

            }).catch((error) => {

            res.status(500).send({
                error: 0x0010,
                error_dsc: "Error en la base de datos"
            });
        })

    } else {


        res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });

    }
}

function setFavorite(req, res) {

    // TODO VEr esto https://stackoverflow.com/questions/41788688/mongo-schema-array-of-string-with-unique-values,
    // parece ser una mejor forma

    let db = pdc.db;

    let {subscriberId, channelId, favorite} = req.body;

    if (db) {
        db.Subscribers.findOne({_id: subscriberId}, (error, subscriber) => {

            if (error) {
                console.error(error);
                res.status(500).send({
                    error: 0x0010,
                    error_dsc: "Error en la base de datos"
                });
            } else {
                if (subscriber) {

                    let newVector = [];

                    if (favorite) {
                        newVector.push(channelId);
                    }

                    for (let channel of subscriber.favoriteChannels) {
                        if (channel.toString() !== channelId) {
                            newVector.push(channel.toString());
                        }
                    }

                    db.Subscribers.update({_id: subscriberId}, {$set: {favoriteChannels: newVector}}, function (error) {
                        if (error) {
                            console.error(error);
                            res.status(500).send({
                                error: 0x0030,
                                error_dsc: "Update Error"
                            });
                        } else {
                            res.status(500).send({
                                error: null
                            });
                        }
                    });

                } else {
                    res.status(400).send({
                        error: 0x0020,
                        error_dsc: "User, not found"
                    });
                }
            }

        });
    } else {
        res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }
}

function getFavorite(req, res) {
    let db = pdc.db;

    let {subscriberId, channelId, favorite} = req.body;

    if (db) {
        db.Subscribers.findOne({_id: subscriberId}, (error, subscriber) => {
            if (error) {
                console.error(error);
                res.status(500).send({
                    error: 0x0010,
                    error_dsc: "Error en la base de datos"
                });
            } else {
                if (subscriber) {

                    db.Channels.find({_id: {$in: subscriber.favoriteChannels}}, {updateHistory: 0}, function (error, data) {
                        if (error) {
                            res.status(500).send({
                                error: 0x0010,
                                error_dsc: "Error en la base de datos"
                            });
                        } else {
                            res.send(data);
                        }
                    });

                } else {
                    res.status(400).send({
                        error: 0x0020,
                        error_dsc: "User, not found"
                    });
                }
            }

        });
    } else {
        console.error(error);
        res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }
}

function sendLogs(req, res) {

    let db = pdc.db;

    if (db) {
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

        db.StatsLines.create(opt, function () {
            console.log("LOG LIN INSERTED")
        })

    }


    res.send({});
}

function check_asset_access(req, res) {
    let db = pdc.db;

    let {subscriberId} = req.body;
    let screens = ottConfig.screens;

    if (db) {

        db.StatsLines.find({
            "status": "playing",
            "date": {
                $gt: new Date(Date.now() - 10000)
            },
            "subscriberId": subscriberId
        }, ((error, sessions) => {

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
                res.send({
                    canPlay: false
                });
            } else {
                res.send({
                    canPlay: true
                });
            }

        }));

    }
}


function preChacheDays() {

    let db = pdc.db;

    if (db) {
        db.Channels.find({enabled: true}, function (error, data) {

            for (let i in data) {
                getADay(parseInt(data[i].channelEPGId));
            }

        });

    }

}