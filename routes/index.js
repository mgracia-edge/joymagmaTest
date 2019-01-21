const fs = require('fs');
const {join} = require('path');
const express = require('express');
const router = express.Router();

router.get('/', index);

function index(req, res) {

    if (req.header('X-Forwarded-Proto') && req.header('X-Forwarded-Proto') !== 'https') {
        res.redirect('https://' + req.headers.host + req.url);
    } else {

        res.send({});

    }

}
module.exports = router;
