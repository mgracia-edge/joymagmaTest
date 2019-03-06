const api = require('../support');
const codes = require('../codes');
const dc = require('../../lib/dataConnection');

exports.resourceList = [
    {
        path: "get",
        callback: _get,
        method: "post",
        protected: true
    }];

function _get(req, res) {
    let db = dc.db;

    if (db) {

        // TODO Check if user can access the account
        db.Account.findOne({_id: req.body.id},(error, data)=>{
            if(error){
                res.status(codes.error.database.OPERATION_ERROR.httpCode)
                    .send(new api.Error(codes.error.database.OPERATION_ERROR));
            }else if(data === null){
                res.status(codes.error.operation.TARGET_NOT_FOUND.httpCode)
                    .send(new api.Error(codes.error.operation.TARGET_NOT_FOUND));
            }else{
                res.send(new api.Success(data));
            }
        })

    } else {
        res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }
}