const mongoose = require('mongoose');
const schema = require('./schema');

const URL = typeof process.env.DB_URL !== 'undefined' ? process.env.DB_URL : 'mongodb+srv://nx_studio:U6UBfekBsGUeBW5b@nxservices-pm6cd.gcp.mongodb.net/futbo_prov';

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
        retryWrites: false
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