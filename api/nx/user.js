const api = require('../support');
const codes = require('../codes');
const dc = require('../../lib/dataConnection');

exports.resourceList = [
    {
        path: "login",
        callback: _login,
        method: "post",
        protected: false
    },
    {
        path: "check-session",
        callback: _checkSession,
        method: "post",
        protected: true
    }];


function _login(req, res) {

    const {email, password} = req.body;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;


    if (dc.db) {

        if (email && password) {

            dc.db.User.findOne({
                email: email,
                "authentication.password": api.passHash(password)
            }, function (error, user) {

                if (error) {
                    res.status(codes.error.database.ERROR.httpCode)
                        .send(new api.Error(codes.error.database.ERROR));
                } else if (!user) {
                    res.status(codes.error.userRights.BAD_AUTHENTICATION.httpCode)
                        .send(new api.Error(codes.error.userRights.BAD_AUTHENTICATION));
                } else {

                    const session = {
                        date: new Date(),
                        expires: new Date(Date.now() + 3600000 * 6),
                        lastAccess: new Date(),
                        ip: ip,
                        token: api.newToken()
                    };


                    let sessions = [];

                    if (Array.isArray(user.authentication.sessions)) {
                        for (let session of user.authentication.sessions) {
                            if (session.expires.getTime() > Date.now()) {
                                sessions.push(session);
                            }
                        }
                    }
                    sessions.push(session);

                    dc.db.User.update({email: email}, {
                        $set: {
                            "authentication.sessions": sessions
                        }
                    }, (error, data) => {

                    });


                    res.send(new api.Success({
                        session: session,
                        user: user
                    }))

                }

            })
        } else {
            console.error(new Error(codes.error.operation.OPERATION_INVALID_PARAMETERS.message));
            res.status(codes.error.operation.OPERATION_INVALID_PARAMETERS.httpCode)
                .send(new api.Error(codes.error.operation.OPERATION_INVALID_PARAMETERS));
        }
    } else {
        console.error(new Error(codes.error.database.DISCONNECTED.message));
        res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }

}

function _checkSession(req, res) {
    res.send(new api.Success({
        user: req.user
    }));
}