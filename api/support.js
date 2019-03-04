const crypto = require('crypto');
const dc = require('../lib/dataConnection');
const codes = require('../api/codes');
const api = require('../api/support');


exports.nxAuthenticationFunction = nxAuthenticationFunction;
exports.wiltelAuthenticationFunction = wiltelAuthenticationFunction;

exports.Error = Error_class;
exports.Success = Success_class;
exports.passHash = passHash;
exports.newToken = newToken;

function nxAuthenticationFunction(req, res, next) {

    if (!dc.db) {
        res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    } else if (!(req.headers.authorization && req.headers.authorization.toLowerCase().startsWith("bearer "))) {
        res.status(codes.error.userRights.BAD_AUTHENTICATION.httpCode)
            .send(new api.Error(codes.error.userRights.BAD_AUTHENTICATION));
    } else {
        const token = req.headers.authorization.split(' ')[1];

        dc.db.User.findOne({"authentication.sessions.token": token},
            (error, user) => {

                if (error) {
                    res.status(codes.error.database.ERROR.httpCode)
                        .send(new api.Error(codes.error.database.ERROR));
                } else if (user === null) {
                    res.status(codes.error.userRights.NON_EXISTENT_USER.httpCode)
                        .send(new api.Error(codes.error.userRights.NON_EXISTENT_USER));
                } else {

                    if (!sessionIsValid(user, token)) {
                        res.status(codes.error.userRights.SESSION_EXPIRED.httpCode)
                            .send(new api.Error(codes.error.userRights.SESSION_EXPIRED));
                    } else {

                        let currentSession;

                        for (let session of user.authentication.sessions) {
                            if (session.token === token) {
                                currentSession = session;
                            }
                        }

                        req.user = user;
                        req.session = currentSession;

                        next();
                    }

                }
            });

    }

}

function sessionIsValid(user, token) {

    try {
        for (let session of user.authentication.sessions) {
            if (session.token === token) {
                if (session.expires.getTime() > Date.now()) {
                    return true
                }
            }
        }
    } catch (unused) {

    }

    return false;

}

function wiltelAuthenticationFunction(req, res, next) {

    const token = 'L2W-K0C-A3Q-6DR';

    if (
        req.headers.authorization &&
        req.headers.authorization.toLowerCase().split('bearer ')[1] === token.toLowerCase()
    ) {
        next();
    } else {
        res.status(403).send({
            error: 0x0021,
            error_dsc: "Acceso denegado, credenciales inválidas."
        });

    }

}

function passHash(str) {
    return crypto.createHash('sha256').update(str).digest('base64');
}

function Error_class(codeObject) {
    this.error = {
        code: codeObject.code,
        message: codeObject.message
    };

    this.data = null
}

function Success_class(payload) {
    this.error = null;
    this.content = payload;
}

function newToken() {
    return Date.now().toString(36) + "/" + passHash(Math.random() + "_" + Date.now() + "_" + Math.random());
}