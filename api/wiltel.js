const pdc = require("../lib/provisoryDataConnection");
const path = require("path");
const fs = require('fs');
const request = require("request");

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
        formData:{
            Usuario:"epa",
            Password:"wil2019tel"
        }
    };

    let result = request.post(options,(err,httpResponse,body)=>{
        if(err) res.send(err);
        res.status(200).send(body);
    });

    //console.log(result)



}
