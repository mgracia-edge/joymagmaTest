const path = require("path");
const fs = require('fs');
const request = require("request");
const Client = require('ftp');
const parseString = require('xml2js').parseString;

const pdc = require("../lib/provisoryDataConnection");

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
    }
];

/** Programme Update Service ***/

function listProgramme() {
    return new Promise((resolve, reject) => {
        parseString(fs.readFileSync(path.join(__dirname, '../res/reportv.xml'), 'latin1'), function (err, result) {
            resolve(result.tv.programme)
        });
    })


}

function downloadReportTV() {
    return new Promise((resolve,reject)=>{

        let ftp = new Client();

        ftp.on('ready', () => {

            ftp.list((err, list) => {
                if (err) reject();

                let lastFile = list[list.length - 1].name;

                ftp.get(lastFile, function (err, stream) {
                    if (err) reject();

                    stream.once('close', function () {

                        resolve();

                        ftp.end();

                    });

                    stream.pipe(fs.createWriteStream(path.join(__dirname, '../res/reportv.xml')));
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

let programmeUpdateService = setTimeout(() => {

    function parseDate(string) {
        return new Date(
            string.substring(0, 4) + "/" +
            string.substring(4, 6) + "/" +
            string.substring(6, 8)
        ).setHours(string.substring(8, 10),string.substring(10, 12),0);
    }

    downloadReportTV()
        .then(listProgramme)
        .then((list) => {
        let db = pdc.db;

        if (db) {

            db.Programme.deleteMany().then(()=>{
                let arr = [];

                console.log("Registros Eliminados");
                console.log("Numeros de Programas", list.length);

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

                    }

                });
            });



        } else {
            console.log("error")
        }
    });

}, 1000 * 3600 * 24);

/** API ***/

function LoginWOTT(req, res) {

    let options = {
        url: 'https://ws.wiltel.com.ar/WS/CRM.asmx/LoginWOTT',
        agentOptions: {
            pfx: fs.readFileSync(path.join(__dirname, './EPA.pfx')),
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

