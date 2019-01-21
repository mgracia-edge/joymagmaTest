const pdc = require("../lib/provisoryDataConnection");
const path = require("path");
const fs = require('fs');
const request = require("request");

exports.resourceList = [
    {
        path: "ABMPlayme",
        callback: ABMPlayme,
        method: "post",
        protected: false
    }
];

function ABMPlayme(req, res) {

    let db = pdc.db;

    if (db) {

        let {operador, sistema, operacion, suscriptor_id, email, timeout, productos, device_list, device_type_list, celular} = req.body;

        if (operador && sistema && operacion && suscriptor_id) {

            let json = {
                operator: operador,
                system: sistema,
                subscriberId: suscriptor_id
            };

            if(email) json["email"] = email;
            //if(timeout) json["email"] = email;
            if(device_list) json["email"] = email;
            if(device_type_list) json["email"] = email;
            if(celular) json["email"] = email;

            let Subscribers = new db.Subscribers(json);
/*
            Subscribers.save(function (err) {
                if (err) {
                    console.warn(err);
                    res.status(500).send({error: "db error"});
                } else {
                    res.send({error: null, userData: json});
                }

            });
*/
            res.status(200).send({});
        }

        res.status(403).send({error: "error en parametros"});


    } else {
        res.status(500).send({error: "db error"});
    }


}
