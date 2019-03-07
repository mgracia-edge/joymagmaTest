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

            function Users($http, $q) {

                function create(params) {
                    return $q((resolve, reject) => {
                        $http.post("/api/0.1/user/create", params)
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
                        $http.post("/api/0.1/user/read", params)
                            .then(({data}) => {

                                resolve({
                                    users: data.users,
                                    count: data.count
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
                            id:params._id,
                            data:params
                        }, {
                            headers: {
                                "Authorization": "Bearer " + session.token
                            }
                        })
                            .then(({data}) => {

                                console.log("update user", data)
                                resolve({});
                            })
                            .catch((error) => {
                                reject(error)
                            });
                    });
                }

                function remove() {
                    return $q((resolve, reject) => {

                    });
                }

                return {
                    create,
                    read,
                    update,
                    delete: remove,
                }
            }

            init();

            return {
                login: login,
                setAfterLogin: setAfterLogin,
                getUser: getUser,
                getAccount: getAccount,
                users: Users($http, $q)
            }
        }]);


})();