const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let db = {
    connected: true
};

exports.bind = function () {

    /* START Subscribers SCHEMA */
    let subscribersSchema = new Schema({
        "operator": {type: String, index: true},
        "system": String,
        "subscriberId": String, // Id del cliente Wiltel
        "email": {type: String, index: true, unique: true},
        "products": [String], // Id tipo ObjectId de mongo que identifica el paquete o producto,
        "creationDate": Date,
        "lastUpdate": Date,
        "updateHistory": [{
            "date": Date,
            "type": String, // A, M
            "products": [String]
        }]
    });

    db.Subscribers = mongoose.model('subscribers', subscribersSchema);

    db.Subscribers.UpdateHistoryType = {
        Create: 'A',
        Update: 'M'
    };

    /* START Products SCHEMA */
    let productsSchema = new Schema({
        "operator": {type: String, index: true}
    });

    db.Products = mongoose.model('products', productsSchema);

    return db;
};
