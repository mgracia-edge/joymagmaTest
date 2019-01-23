const pdc = require("../lib/provisoryDataConnection");

exports.resourceList = [
    {
        path: "ABMPlayme",
        callback: ABMPlayme,
        method: "post",
        protected: true
    }
];

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
                            console.log(error, data);
                            console.log("alta")
                            res.status(500).send({error: "db error"});
                        } else {
                            if (data) {

                                res.status(200).send({error: "suscriptor_id duplicado"});
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
                                        res.status(500).send({error: "db error"});
                                    } else {
                                        res.status(200).send({error: null, subscriber: json});
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
                            res.status(500).send({error: "db error"});
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
                                        res.status(500).send({error: "db error"});
                                    } else {
                                        res.send({error: null});
                                    }

                                });
                            } else {
                                res.status(200).send({error: "No se encuentra un Subscriber para realizar un update."});
                            }
                        }
                    });

            } else {
                res.status(400).send({error: "error en parametros"});
            }

        } else {
            res.status(400).send({error: "error en parametros"});
        }

    } else {

        res.status(500).send({error: "db error"});
    }


}
