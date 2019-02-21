/*
 * Copyright (C) 2018 ENTERTAINMENT PORTAL OF THE AMERICAS, LLC.
 *
 *  NOTICE:  All information contained herein is, and remains the property of
 * ENTERTAINMENT PORTAL OF THE AMERICAS, LLC ; if any.
 *
 *  The intellectual and technical concepts contained herein are proprietary to ENTERTAINMENT PORTAL OF THE AMERICAS, LLC
 *  and its suppliers and may be covered by U.S. and Foreign Patents, patents in
 *  process, and are protected by trade secret or copyright law. Dissemination of this
 *  information or reproduction of this material is strictly forbidden unless prior written
 *  permission is obtained from ENTERTAINMENT PORTAL OF THE AMERICAS, LLC.
 */

const fs = require('fs');
const {join} = require('path');
const express = require('express');
const router = express.Router();
const maxmind = require('maxmind');
const siteSettings = require('../lib/appSettings');


let  js;

if(process.env.ENV && process.env.ENV === "PROD"){
    js = ["app.js"]
}else{
    js =  getJSFiles("/javascript", join(__dirname, "../public/javascript"))
}

let country;

maxmind.open(join(__dirname, "../res/raw/GeoIP2-Country.mmdb"), (err, countryResult) => {

    if (err) {
        console.error("Fail to load Maxmind Database")
    } else {
        country = countryResult;
    }

});

router.get('/', index);
router.get('/terms', terms);
router.get('/privacy-policy', privacyPolicy);

function index(req, res) {

    if (req.header('X-Forwarded-Proto') && req.header('X-Forwarded-Proto') !== 'https') {
        res.redirect('https://' + req.headers.host + req.url);
    } else {

        if (checkSiteRules(req)) {
            res.render('index', {title: siteSettings.settings.title, javascript: js});
        } else {

            let ipAddr = getIp(req);

            let geo = country.get(ipAddr);

            let countyName;

            if (geo === null) {
                countyName = "localización no definida";
            } else {
                countyName = geo.country.names.es
            }
            res.render('geo_block', {title: siteSettings.settings.title, countyName: countyName});
        }

    }

}


function terms(req, res, next) {
    res.render('terms', {title: siteSettings.settings.title});
}

function privacyPolicy(req, res, next) {
    res.render('privacy-policy', {title: siteSettings.settings.title});
}

function getJSFiles(root, path) {
    let module = [],
        controller = [],
        service = [],
        low = [];

    let files = fs.readdirSync(path);

    for (let file of files) {

        if (file.endsWith(".js")) {

            if (file.startsWith("module_")) {
                module.push(join(root, file));
            } else if (file.startsWith("service_")) {
                service.push(join(root, file));
            } else if (file.startsWith("controller_")) {
                controller.push(join(root, file));
            } else {
                low.push(join(root, file));
            }

        }
    }

    return module.concat(service, controller, low);

}

function checkSiteRules(req) {

    return true;

}


function getIp(req) {
    let ipAddr = req.headers["x-forwarded-for"];
    if (ipAddr) {
        let list = ipAddr.split(",");
        ipAddr = list[list.length - 1];
    } else {
        ipAddr = req.connection.remoteAddress;
    }

    return ipAddr;
}

module.exports = router;
