const api = require('../support');
const codes = require('../codes');

exports.resourceList = [
    {
        path: "find",
        callback: _find,
        method: "post",
        protected: true
    }];


function _find(req, res) {
    res
        .status(codes.error.operation.OPERATION_NOT_IMPLEMENTED.httpCode)
        .send(new api.Error(codes.error.operation.OPERATION_NOT_IMPLEMENTED));
}
