const api = require('../support');
const codes = require('../codes');
const dc = require('../../lib/dataConnection');
const {join} = require("path");
const maxmind = require("maxmind");
const parser = require('ua-parser-js');

let country;

maxmind.open(join(__dirname, "../../res/raw/GeoIP2-Country.mmdb"), (err, countryResult) => {

    if (err) {
        console.error("Fail to load Maxmind Database")
    } else {
        country = countryResult;
    }
});

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
    },
    {
        path: "create",
        callback: _create,
        method: "post",
        protected: true
    },
    {
        path: "read",
        callback: _read,
        method: "post",
        protected: true
    },
    {
        path: "update",
        callback: _update,
        method: "post",
        protected: true
    },
    {
        path: "delete",
        callback: _delete,
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
        user: req.user,
        session: req.session
    }));

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


/* CRUD */

function _create(req, res) {
    let db = dc.db;

    if (db) {

        if (!req.user.permissions.includes(codes.users_permissions.USER_ADMIN)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.DISCONNECTED));

            return;
        }

        const {email, firstName, lastName, password, permissions} = req.body;

        db.User
            .findOne({"email": email}, (error, data) => {
                if (error) {
                    res.status(codes.error.database.DISCONNECTED.httpCode)
                        .send(new api.Error(codes.error.database.DISCONNECTED));
                } else {
                    if (data) {
                        res.status(codes.error.operation.DUPLICATED_ENTITY.httpCode)
                            .send(new api.Error(codes.error.operation.DUPLICATED_ENTITY));
                    } else {

                        let mIpAddress = getIp(req);
                        let geo = country.get(mIpAddress);
                        let ua = parser(req.headers['user-agent']);

                        let json = {
                            email: email,
                            firstName: firstName,
                            lastName: lastName,
                            authentication: {
                                password: api.passHash(password)
                            },
                            creation: {
                                date: new Date(),
                                ip: mIpAddress,
                                device: {
                                    mobile: typeof ua.device.vendor !== 'undefined',
                                    osName: ua.os.name,
                                    osVersion: ua.os.version,
                                    browserName: ua.browser.name,
                                    browserVersion: ua.browser.version
                                }
                            },
                            permissions: permissions
                        };

                        if (geo !== null) {
                            json.creation.location = {
                                countryCode: geo.country.iso_code,
                                city: geo.country.names.es
                            }
                        }

                        let User = new db.User(json);

                        User.save(json, (err) => {
                            if (err) {
                                console.error(err);
                                res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
                                    .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
                            } else {
                                res.status(200).send(new api.Success({}));

                            }

                        });
                    }
                }
            });

    } else {

        res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }
}

function _read(req, res) {
    let db = dc.db;

    if (db) {

        if (!req.user.permissions.includes(codes.users_permissions.USER_ADMIN)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.DISCONNECTED));

            return;
        }

        let {id, email} = req.body;

        let query = {
            find: {},
            sort: {
                email: 1
            }
        };

        if (id) {

            query.find = {_id: Array.isArray(id) ? {$in: id} : id}

        } else if (email) {

            query.find = {email: Array.isArray(email) ? {$in: email} : email}

        }

        db.User
            .find(query.find)
            .sort(query.sort)
            .then((products) => {

                res.status(200).send(new api.Success(products));

            }).catch((error) => {
            console.log(error)
            res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
                .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
        })

    } else {

        res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }
}

function _update(req, res) {
    let db = dc.db;

    if (db) {

        console.log(req.user)

        if (!req.user.permissions.includes(codes.users_permissions.USER_ADMIN)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.DISCONNECTED));

            return;
        }

        const {id, data} = req.body;

        const {firstName, lastName, password, permissions} = data;

        let query = {
            find: {
                _id: id
            },
            update: {
                $set: {
                    firstName: firstName,
                    lastName: lastName,
                    "authentication.password": password,
                    permissions: permissions
                }
            }
        };

        if (typeof firstName === 'undefined') delete query.update.$set.firstName;
        if (typeof lastName === 'undefined') delete query.update.$set.lastName;
        if (typeof password === 'undefined') delete query.update.$set["authentication.password"];
        if (typeof permissions === 'undefined') delete query.update.$set.permissions;

        db.User.updateOne(query.find, query.update, (error, products) => {
            if (error) {
                res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
                    .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
            } else {
                res.status(200).send(new api.Success(products));
            }

        });

    } else {

        res.status(codes.error.operation.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }
}

function _delete(req, res) {

    let db = dc.db;

    if (db) {

        if (!req.user.permissions.includes(codes.users_permissions.USER_ADMIN)) {

            res.status(codes.error.userRights.PERMISSION_DENIED.httpCode)
                .send(new api.Error(codes.error.userRights.DISCONNECTED));

            return;
        }

        const {id} = req.body;

        let query = {
            find: {
                _id: Array.isArray(id) ? {$in: id} : id
            }
        };

        db.User
            .remove(query.find)
            .then((data) => {

                res.status(200).send(new api.Success({}));

            }).catch((error) => {

            res.status(codes.error.operation.OPERATION_HAS_FAILED.httpCode)
                .send(new api.Error(codes.error.operation.OPERATION_HAS_FAILED));
        })

    } else {

        res.status(codes.error.database.DISCONNECTED.httpCode)
            .send(new api.Error(codes.error.database.DISCONNECTED));
    }
}
