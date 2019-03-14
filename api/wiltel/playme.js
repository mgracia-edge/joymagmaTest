const path = require("path");
const fs = require('fs');
const request = require("request");
const Client = require('ftp');
const parseString = require('xml2js').parseString;
const api = require("../support");
const C = require("../codes");

const REPO_DIR = "../../res/reporttv";
const WILTEL_KEY_PATH = path.join(__dirname, '../../res/EPA.pfx');

const pdc = require("../../lib/dataConnection");

let currentWiltelToken = null;

exports.resourceList = [
    {
        path: "abm",
        callback: ABMPlayme,
        method: "post",
        protected: true
    },
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
        path: "get_a_week",
        callback: getAWeek,
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
        path: "get_products",
        callback: getProducts,
        method: "post",
        protected: false
    }
];

/** Programme Update Service ***/

function listProgramme() {
    return new Promise((resolve, reject) => {
        parseString(fs.readFileSync(path.join(__dirname, '../../res/reporttv/file.xml'), 'latin1'), (err, result) => {
            if (err) reject(err);

            resolve(result.tv.programme)
        });
    })


}

function downloadReportTV() {
    console.log('Descargando archivo de programas...');

    fs.access(path.join(__dirname, REPO_DIR, 'file.xml'), fs.constants.F_OK, (err) => {
        if (!err) {
            fs.unlink(path.join(__dirname, REPO_DIR, 'file.xml'), (err) => {
                if (err) console.log(err);
                console.log('Archivo descargado Eliminado');
            });
        }


    });

    return new Promise((resolve, reject) => {

        let ftp = new Client();

        try {
            fs.mkdirSync(path.join(__dirname, REPO_DIR), {recursive: true})
        } catch (err) {
            if (err.code !== "EEXIST") {
                throw err;
            }
        }


        ftp.on('ready', () => {

            ftp.list((err, list) => {
                if (err) reject();

                let lastFile = list[list.length - 1].name;

                ftp.get(lastFile, function (err, stream) {
                    if (err) reject();

                    stream.once('close', function () {
                        console.log('Archivo descargado');
                        resolve();

                        ftp.end();

                    });

                    stream.pipe(fs.createWriteStream(path.join(__dirname, REPO_DIR, 'file.xml')));

                });
            });
        });

        ftp.connect({
            host: 'ftp.filestv.com.ar',
            user: 'NexTV',
            password: 'nextvepg123'
        });
    });
}

function programmeUpdateService() {
    function parseDate(string) {
        return new Date(
            string.substring(0, 4) + "/" +
            string.substring(4, 6) + "/" +
            string.substring(6, 8)
        ).setHours(string.substring(8, 10), string.substring(10, 12), 0);
    }

    downloadReportTV()
        .then(listProgramme)
        .then((list) => {
            let db = pdc.db;

            if (db) {

                db.Programme.deleteMany().then(() => {
                    let arr = [];

                    console.log("Registros Eliminados");

                    list.forEach((item) => {

                        let json = {
                            "start": parseDate(item["$"].start),
                            "stop": parseDate(item["$"].stop),
                            "title": item.title[0]["_"],
                            "description": item.desc[0]["_"],
                            "credits": item.credits ? item.credits[0] : '',
                            "category": parseInt(item.category[0]["_"]),
                            "subCategory": parseInt(item["sub-category"][0]["_"]),
                            "parentalCode": parseInt(item["$"]['parental-code']),
                            "channelEPGId": parseInt(item["$"]['channel'])
                        };

                        arr.push(json);

                    });

                    db.Programme.insertMany(arr, (err) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Numeros de Programas agregados", list.length);
                        }

                    });
                });


            } else {
                console.log("error")
            }
        });
}

let intervalID = setInterval(programmeUpdateService, 1000 * 3600 * 24);

programmeUpdateService();

/** API Interface Wiltel ***/

function LoginWOTT(req, res) {

    let options = {
        url: 'https://ws.wiltel.com.ar/WS/CRM.asmx/LoginWOTT',
        agentOptions: {
            pfx: fs.readFileSync(WILTEL_KEY_PATH),
            passphrase: 'Wiltel19',
            securityOptions: 'SSL_OP_NO_SSLv3'
        },
        formData: {
            Usuario: "epa",
            Password: "wil2019tel"
        }
    };

    let result = request.post(options, (err, httpResponse, body) => {
        if (err) res.send(err);
        res.status(200).send(body);
    });

    //console.log(result)

}

setInterval(renewWiltelToken, 60 * 3600000);

function renewWiltelToken() {
    let options = {
        url: 'https://ws.wiltel.com.ar/WS/CRM.asmx/LoginWOTT',
        agentOptions: {
            pfx: fs.readFileSync(WILTEL_KEY_PATH),
            passphrase: 'Wiltel19',
            securityOptions: 'SSL_OP_NO_SSLv3'
        },
        formData: {
            Usuario: "epa",
            Password: "wil2019tel"
        }
    };

    request.post(options, (err, httpResponse, body) => {
        if (err) res.send(err);
        console.log("token actualizado ", body);
        currentWiltelToken = body;
    });
}

renewWiltelToken();

function checkSubscriberCredentials(req, res) {
    const {email, password} = req.body;

    if (email && password) {

        let db = pdc.db;

        if (db) {

            db.Subscribers.findOne({email: email}, function (error, storedSubscriber) {

                if (error) {

                    res.status(C.error.database.ERROR.httpCode).send(new
                    api.Error(C.error.database.ERROR));

                } else {
                    if (storedSubscriber) {
                        const subscriberId = storedSubscriber.subscriberId;

                        if (currentWiltelToken) {

                            let options = {
                                url: 'https://ws.wiltel.com.ar/WS/CRM.asmx/LoginWOTT',
                                agentOptions: {
                                    pfx: fs.readFileSync(WILTEL_KEY_PATH),
                                    passphrase: 'Wiltel19',
                                    securityOptions: 'SSL_OP_NO_SSLv3'
                                },
                                formData: {
                                    id: subscriberId,
                                    Password: password,
                                    auth_usuario: "epa",
                                    token: currentWiltelToken
                                }
                            };

                            request.post(options, (err, httpResponse, response) => {
                                if (err) {
                                    res.status(C.error.connection.UNKNOWN.httpCode).send(new // TODO Replace with BAD GATEWAY
                                    api.Error(C.error.connection.UNKNOWN));
                                } else {
                                    if (response.indexOf("NO VÁLIDO") !== -1) {
                                        res.status(C.error.userRights.BAD_AUTHENTICATION.httpCode).send(new
                                        api.Error(C.error.userRights.BAD_AUTHENTICATION));
                                    } else {
                                        res.status(200).send(new api.Success({subscriber: storedSubscriber}));
                                    }
                                }

                            });

                        } else {
                            res.status(C.error.connection.UNKNOWN.httpCode).send(new // TODO Replace with BAD GATEWAY
                            api.Error(C.error.connection.UNKNOWN));
                        }

                    } else {
                        res.status(C.error.userRights.NON_EXISTENT_USER.httpCode).send(new
                        api.Error(C.error.userRights.NON_EXISTENT_USER));
                    }
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

function ABMPlayme(req, res) {

    let db = pdc.db;

    if (db) {

        let {operador, sistema, operacion, suscriptor_id, email, timeout, productos, device_list, device_type_list, celular} = req.body;

        if (operador && sistema && operacion && suscriptor_id) {

            let products = typeof productos === "string" && productos.length !== 0 ? productos.split(",").filter(elem => elem !== '') : [];

            if (operacion === db.Subscribers.UpdateHistoryType.Create) {

                db.Subscribers
                    .findOne({"subscriberId": suscriptor_id}, (error, data) => {
                        if (error) {

                            res.status(500).send({
                                error: 0x0010,
                                error_dsc: "Error en la base de datos"
                            });
                        } else {
                            if (data) {

                                res.status(200).send({
                                    error: 0x0030,
                                    error_dsc: "Subscriber ID duplicado."
                                });
                            } else {

                                let json = {
                                    operator: operador,
                                    system: sistema,
                                    subscriberId: suscriptor_id,
                                    lastUpdate: new Date(),
                                    creationDate: new Date(),
                                    products: products,
                                    updateHistory: [{
                                        date: new Date(),
                                        type: operacion,
                                        products: products
                                    }]
                                };

                                if (email) json.email = email;

                                let Subscribers = new db.Subscribers(json);

                                Subscribers.save(json, (err) => {
                                    if (err) {
                                        console.log(err);
                                        res.status(500).send({
                                            error: 0x0010,
                                            error_dsc: "Error en la base de datos"
                                        });
                                    } else {
                                        res.status(200).send({error: 0});
                                    }

                                });
                            }
                        }
                    });

            } else if (operacion === db.Subscribers.UpdateHistoryType.Update) {

                db.Subscribers
                    .findOne({"subscriberId": suscriptor_id}, (error, data) => {
                        if (error) {
                            console.log(error);
                            res.status(500).send({
                                error: 0x0010,
                                error_dsc: "Error en la base de datos"
                            });
                        } else {
                            if (data) {

                                let query = {
                                    subscriberId: suscriptor_id
                                };

                                let update = {
                                    $set: {
                                        operator: operador,
                                        system: sistema,
                                        lastUpdate: new Date()
                                    }
                                };

                                update["$push"] = {};
                                update["$push"].updateHistory = {
                                    date: new Date(),
                                    type: operacion
                                };

                                if (email) update["$set"].email = email;


                                update["$set"].products = products;
                                update["$push"].updateHistory.products = products;


                                db.Subscribers.updateOne(query, update, (error, subscriber) => {
                                    if (error) {
                                        console.warn(error);
                                        res.status(500).send({
                                            error: 0x0010,
                                            error_dsc: "Error en la base de datos"
                                        });
                                    } else {
                                        res.send({error: 0});
                                    }

                                });
                            } else {
                                res.status(200).send({
                                    error: 0x0031,
                                    error_dsc: "No se encuentra un Subscriber para realizar un update."
                                });
                            }
                        }
                    });

            } else {
                res.status(400).send({
                    error: 0x0020,
                    error_dsc: "error en parametros"
                });
            }

        } else {
            res.status(400).send({
                error: 0x0020,
                error_dsc: "error en parametros"
            });
        }

    } else {

        res.status(500).send({
            error: 0x0010,
            error_dsc: "Error en la base de datos"
        });
    }


}

function getCurrentProgramme(req, res) {

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

function getChannels(req, res) {

    let db = pdc.db;

    if (db) {

        let channelId = req.body.id;

        if (!Number.isInteger(channelId) && !Array.isArray(channelId)) {

            res.status(400).send({
                error: 0x0022,
                error_dsc: "channeId debe ser del tipo INT o [INT]"
            });

            return false
        }

        let query = {
            find: {
                _id: Array.isArray(channelId) ? {$in: channelId} : channelId
            },
            sort: {
                name: 1
            }
        };

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

function getProducts(req, res) {


    let db = pdc.db;

    if (db) {

        let productId = req.body.id;

        if (!Number.isInteger(productId) && !Array.isArray(productId)) {

            res.status(400).send({
                error: 0x0022,
                error_dsc: "channeId debe ser del tipo INT o [INT]"
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

                res.status(200).send(products);

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

