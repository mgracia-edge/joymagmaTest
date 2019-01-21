const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let db = {
    connected: true
};

exports.bind = function () {

    /* START USER SCHEMA */
    let userSchema = new Schema({

    });
    db.User = mongoose.model('users', userSchema);

    db.User.BillingSubcriptionStatus = {
        Active: 'Active',
        Suspended: 'Suspended',
        Cancelled: 'Cancelled',
        Pending: 'Pending'
    };

    return db;
};
