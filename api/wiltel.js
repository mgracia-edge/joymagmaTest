const pdc = require("../lib/provisoryDataConnection");
const path = require("path");
const fs = require('fs');
const request = require("request");

const Client = require('ftp');
const parseString = require('xml2js').parseString;

exports.resourceList = [
    {
        path: "verify",
        callback: verify,
        method: "post",
        protected: false
    }
];

function verify(req, res) {

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

function reportTV() {


    let c = new Client();

    c.on('ready', () => {
        c.list((err, list) => {
            if (err) throw err;

            let lastFile = list[list.length - 1].name;

            c.get(lastFile, function (err, stream) {
                if (err) throw (err);
                stream.once('close', function () {

                    c.end();

                });
                stream.pipe(fs.createWriteStream(path.join(__dirname, '../res/reportv.xml')));
            });
        });
    });

    c.connect({
        host: 'ftp.filestv.com.ar',
        user: 'NexTV',
        password: 'nextvepg123'
    });


}

function listProgramme() {
    return new Promise((resolve, reject) => {
        parseString(fs.readFileSync(path.join(__dirname, '../res/reportv.xml'), 'latin1'), function (err, result) {
            resolve(result.tv.programme)
        });
    })


}

function parseDate(string) {

    let date = new Date(
        string.substring(0, 4) + "/" +
        string.substring(4, 6) + "/" +
        string.substring(6, 8)
    ).setHours(string.substring(8, 10),string.substring(10, 12),0);

    return date;
}

setTimeout(() => {
    listProgramme().then((list) => {
        let db = pdc.db;

        if (db) {

            db.Programme.deleteMany().then(()=>{
                console.log("Registros Eliminados");

                let arr = [];

                console.log("Numeros de Programas", list.length)

                list.forEach((item) => {

                    //console.log(item)

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

                    arr.push(json)


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

}, 3000);


