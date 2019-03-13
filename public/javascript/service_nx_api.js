/*
 * Copyright (C) 2018 ENTERTAINMENT PORTAL OF THE AMERICAS, LLC.
 *
 *  NOTICE:  All information contained herein is, and remains the property of
 * ENTERTAINMENT PORTAL OF THE AMERICAS, LLC ; if any.
 *
 *  The intellectual and technical concepts contained herein are proprietary to ENTERTAINMENT PORTAL OF THE AMERICAS, LLC
 *  and its suppliers and may be covered by U.S. and Foreign Patents, patents in
 *  process, and are protected by trade secret or copyright law. Dissemination of this
 *  information or reproduction of this material is strictly forbidden unless prior written
 *  permission is obtained from ENTERTAINMENT PORTAL OF THE AMERICAS, LLC.
 */
(function () {

    angular.module('NxStudio')
        .factory('$NxApi', ['$http', '$q', '$NxNav', function ($http, $q, $NxNav) {

            const HOST = "";
            const LOGIN_PATH = "/api/1.0/user/login";
            const LOGIN_AS_USER_PATH = "/api/1.0/user/login_as_user";
            const CHECK_SESSION = "/api/1.0/user/check-session";
            const GET_ACCOUNT = "/api/1.0/account/get";

            let session = {
                user: null,
                token: null
            };

            let afterLoginCallback = null;

            function init() {
                if (localStorage.getItem("token")) {
                    session.token = localStorage.getItem("token");
                }
            }

            function getURI(path) {
                return HOST + path;
            }

            function login(email, password) {

                return $q((success, reject) => {

                    if (email === undefined) {

                        if (session.token) {
                            $http.post(getURI(CHECK_SESSION), {}, {
                                headers: {
                                    "Authorization": "Bearer " + session.token
                                }
                            }).then((response) => {
                                preSuccess(response.data)
                            }).catch((error) => {
                                reject(error)
                            });
                        } else {
                            reject(new Error("Session data not hosted"));
                        }
                    } else {

                        $http.post(getURI(LOGIN_PATH), {
                            "email": email,
                            "password": password
                        }).then((response) => {
                            preSuccess(response.data)
                        }).catch((error) => {
                            reject(error)
                        });

                    }

                    function preSuccess(response) {

                        session.user = response.content.user
                        session.data = response.content.session

                        localStorage.setItem("token", session.data.token);

                        let account = null;

                        getAccount(response.content.user.account).then((data) => {
                            account = data;
                        }).catch((b) => {
                        }).finally(() => {
                            $NxNav.loadRootLevel(session.user, account);
                            success(response.content.user);
                            if (afterLoginCallback) afterLoginCallback();
                        })


                    }

                })

            }

            function loginAsUser(email, password) {

                return $q((success, reject) => {

                    $http.post(getURI(LOGIN_AS_USER_PATH), {
                        "email": email,
                        "password": password
                    },{
                        headers: {
                            "Authorization": "Bearer " + session.token
                        }
                    }).then((response) => {
                        preSuccess(response.data)
                    }).catch((error) => {
                        reject(error)
                    });

                    function preSuccess(response) {

                        session.user = response.content.user
                        session.data = response.content.session

                        localStorage.setItem("token", session.data.token);

                        let account = null;

                        getAccount(response.content.user.account).then((data) => {
                            account = data;
                        }).catch((b) => {
                        }).finally(() => {
                            $NxNav.loadRootLevel(session.user, account);
                            success(response.content.user);
                            if (afterLoginCallback) afterLoginCallback();
                        })

                    }

                })

            }

            function setAfterLogin(callback) {
                afterLoginCallback = callback;
            }

            function getUser() {
                return session.user;
            }

            function getAccount(id) {
                return $q((success, reject) => {
                    $http.post(getURI(GET_ACCOUNT), {
                        id: id
                    }, {
                        headers: {
                            "Authorization": "Bearer " + session.token
                        }
                    }).then((response) => {
                        if (response.data.error !== null) {
                            reject(response.data.error)
                        } else {
                            success(response.data.content)
                        }
                    }).catch((error) => {
                        reject(error)
                    });
                })
            }

            function Account($http, $q){

                function update(params) {

                    return $q((resolve, reject) => {
                        $http.post("/api/1.0/account/update", {
                            id: params._id,
                            data: params
                        }, {
                            headers: {
                                "Authorization": "Bearer " + session.token
                            }
                        })
                            .then(({data}) => {
                                resolve({});
                            })
                            .catch((error) => {
                                reject(error)
                            });
                    });
                }

                return {
                    update,
                }
            }

            function channelsDelegation($http, $q) {

                function create(params) {
                    return $q((resolve, reject) => {
                        $http.post("/api/1.0/channels/create", params, {
                            headers: {
                                "Authorization": "Bearer " + session.token
                            }
                        })
                            .then(({data}) => {
                                resolve(data);

                            })
                            .catch((error) => {
                                reject(error)
                            });
                    });
                }

                function read(params) {

                    return $q((resolve, reject) => {
                        $http.post("/api/1.0/channels/read", {
                            id: params._id,
                            data: params
                        }, {
                            headers: {
                                "Authorization": "Bearer " + session.token
                            }
                        })
                            .then(({data}) => {

                                resolve(data.content);
                            })
                            .catch((error) => {
                                reject(error)
                            });
                    });
                }

                function update(params) {

                    return $q((resolve, reject) => {
                        $http.post("/api/1.0/channels/update", {
                            id: params._id,
                            data: params
                        }, {
                            headers: {
                                "Authorization": "Bearer " + session.token
                            }
                        })
                            .then(({data}) => {
                                resolve({});
                            })
                            .catch((error) => {
                                reject(error)
                            });
                    });
                }

                function remove(params) {
                    return $q((resolve, reject) => {
                        $http.post("/api/1.0/channels/delete", {
                            id: params._id
                        }, {
                            headers: {
                                "Authorization": "Bearer " + session.token
                            }
                        })
                            .then(({data}) => {
                                resolve({});
                            })
                            .catch(({error}) => {
                                reject(error)
                            });
                    });
                }

                return {
                    create,
                    read,
                    update,
                    delete: remove,
                }
            }

            function Users($http, $q) {

                function create(params) {
                    return $q((resolve, reject) => {

                    });
                }

                function read(params) {

                    return $q((resolve, reject) => {
                        $http.post("/api/1.0/user/read", {
                            id: params._id,
                            data: params
                        }, {
                            headers: {
                                "Authorization": "Bearer " + session.token
                            }
                        })
                            .then(({data}) => {

                                resolve({
                                    users: data.content
                                });
                            })
                            .catch((error) => {
                                reject(error)
                            });
                    });
                }

                function update(params) {

                    return $q((resolve, reject) => {
                        $http.post("/api/1.0/user/update", {
                            id: params._id,
                            data: params
                        }, {
                            headers: {
                                "Authorization": "Bearer " + session.token
                            }
                        })
                            .then(({data}) => {
                                resolve({});
                            })
                            .catch((error) => {
                                reject(error)
                            });
                    });
                }

                function remove(params) {
                    return $q((resolve, reject) => {
                        $http.post("/api/1.0/user/delete", {
                            id: params._id
                        }, {
                            headers: {
                                "Authorization": "Bearer " + session.token
                            }
                        })
                            .then(({data}) => {
                                resolve({});
                            })
                            .catch((error) => {
                                reject(error)
                            });
                    });
                }

                return {
                    create,
                    read,
                    update,
                    delete: remove,
                }
            }

            function Subscribers($http, $q) {


                function read(params) {

                    return $q((resolve, reject) => {
                        $http.post("/api/1.0/subscriber/read", {
                        }, {
                            headers: {
                                "Authorization": "Bearer " + session.token
                            }
                        })
                            .then(({data}) => {
                                resolve({
                                    subscribers: data.content
                                });
                            })
                            .catch((error) => {
                                reject(error)
                            });
                    });
                }

                return {
                    read
                }
            }

            init();

            return {
                login: login,
                loginAsUser: loginAsUser,
                setAfterLogin: setAfterLogin,
                getUser: getUser,
                getAccount: getAccount,
                subscribers: Subscribers($http, $q),
                account: Account($http, $q),
                users: Users($http, $q),
                channels: channelsDelegation($http, $q)
            }
        }]);


})();