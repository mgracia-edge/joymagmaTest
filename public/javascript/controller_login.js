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
        .controller("LoginCtrl", ['$scope', '$NxApi','$NxNav', '$location', '$mdToast', function ($scope, $NxApi, $NxNav,$location, $mdToast) {

            // Scope Properties

            // Methods Declaration

            $scope.keyPress = keyPress;
            $scope.checkLogin = checkLogin;

            // Implementation

            function init() {

            }


            function keyPress($event) {
                if ($event.code === "Enter") {
                    checkLogin()
                }
            }

            function checkLogin() {
                if ($scope.loginData.email === "" || $scope.loginData.password === "") {
                    toast("Please complete all your login information")
                } else {
                    $NxApi.login($scope.loginData.email, $scope.loginData.password).then((user) => {
                        $location.path("/");
                    }).catch((error) => {
                        toast("Invalid email or password. Pleas, check your login information.")
                    })
                }
            }

            function toast(msg) {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent(msg)
                        .hideDelay(5000))
                    .then(function () {
                    }).catch(function () {
                });
            }

            init();

        }]);
})();