/*
 * Copyright (C) 2018 EDGE TECHNOLOGY, S.A.
 *
 *  NOTICE:  All information contained herein is, and remains the property of
 * EDGE TECHNOLOGY, S.A ; if any.
 *
 *  The intellectual and technical concepts contained herein are proprietary to EDGE TECHNOLOGY, S.A
 *  and its suppliers and may be covered by U.S. and Foreign Patents, patents in
 *  process, and are protected by trade secret or copyright law. Dissemination of this
 *  information or reproduction of this material is strictly forbidden unless prior written
 *  permission is obtained from EDGE TECHNOLOGY, S.A.
 */

const fs = require('fs');
const {join} = require('path');
const express = require('express');
const router = express.Router();
const maxmind = require('maxmind');
const siteSettings = require('../lib/appSettings');
const dc = require('../lib/dataConnection');


let js;

if (process.env.ENV && process.env.ENV === "PROD") {
    js = ["app.js"]
} else {
    js = getJSFiles("/javascript", join(__dirname, "../public/javascript"))
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
router.get('/login', index);
router.get('/s/:l1', index);
router.get('/s/:l1/:l2', index);
router.get('/s/:l1/:l2/:l3', index);
router.get('/s/:l1/:l2/:l3/:l4', index);
router.get('/terms', terms);
router.get('/privacy-policy', privacyPolicy);

router.get('/mm/frg-67y-75t-klj', mediaMonitor);

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

function mediaMonitor(req, res) {
    let db = dc.db;
    if (db) {
        db.Channels.find({enabled: true}, (error, enabledChannels) => {

            let {p, q} = req.query;

            let list = [];

            for (let i in enabledChannels) {

                if (i >= (p) * q && i < (p + 1) * (q)) {
                    console.log(1)
                    list.push({
                        hash: enabledChannels[i]._id,
                        name: enabledChannels[i].name,
                        hls: `https://joy.nx-pc.edge-apps.net/hls/${enabledChannels[i].publishing[0].streamName}_360p/index.m3u8`
                    });
                } else {
                    console.log(0)
                }

            }
            let h,w;
            if (req.query.h && req.query.w) {
                h = req.query.h;
                w = req.query.w;
            } else if (req.query.h) {
                h = req.query.h;
                w = Math.round(h*1.777);
            } else if (req.query.w) {
                w = req.query.w;
                h = Math.round(w/1.777);
            } else {
                h = 150;
                w = Math.round(150*1.777);
            }

            res.render('monitor', {channels: list, h: h, w: w});

        });
    } else {
        res.send("Error, data base is not connected.");
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
