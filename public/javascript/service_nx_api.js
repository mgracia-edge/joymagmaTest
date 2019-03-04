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
    const C = {}

    angular.module('NxStudio')
        .factory('$NxApi', ['$http', '$q', '$NxNav', function ($http, $q, $NxNav) {

            const HOST = "";
            const LOGIN_PATH = "/api/1.0/user/login";
            const CHECK_SESSIOM = "/api/1.0/user/check-session";

            let session = {
                user: null,
                token: null
            }

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
                            $http.post(getURI(CHECK_SESSIOM), {}, {
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

                        $NxNav.loadRootLevel(session.user)

                        success(response.content.user)
                    }

                })

            }

            function getUser(){
                return session.user;
            }

            init();

            return {
                login: login,
                getUser: getUser
            }
        }]);
})();