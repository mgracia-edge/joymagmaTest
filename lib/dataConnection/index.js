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

const mongoose = require('mongoose');
const schema = require('./schema');

const URL = typeof process.env.DB_URL !== 'undefined' ? process.env.DB_URL : 'mongodb+srv://nx_studio:U6UBfekBsGUeBW5b@nxservices-pm6cd.gcp.mongodb.net/wiltel-comm';

let handlers = [];

exports.db = null;
exports.on = (event, handler) => {
    handlers.push({event: event, handlerFunction: handler});
};

mongoose.connect(URL,
    {
        useNewUrlParser: true,
        autoReconnect: true,
        keepAlive: 1,
        reconnectTries: Number.MAX_VALUE,
        retryWrites: false,
        useCreateIndex: true
    });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.on('connected', () => {
    exports.db = schema.bind();
    handleEvent('connected', null);
});
db.on('disconnected', () => {
    console.log('disconnected')
});

db.once('open', bindSchema);


function bindSchema() {

}

function handleEvent(event, data) {
    for (let handler of handlers){
        if(handler.event === event){
            handler.handlerFunction(data);
        }
    }
}