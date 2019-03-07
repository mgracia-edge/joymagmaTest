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
        .controller("sUserProfileCtrl", ['$scope', '$NxApi', '$mdToast','$location', function ($scope, $NxApi, $mdToast,$location) {

            $scope.updateUser = updateUser;

            function init() {

                let user = $NxApi.getUser();

                $scope.userData = {
                    ...user,
                    newPassword: '',
                    newPasswordVerify: ''
                };

            }

            function verifyPassword() {

                if ($scope.userData.newPassword === $scope.userData.newPasswordVerify) {
                    return true
                }
                toast("Checking if password field and verify password fields are equal");

                return false
            }

            function checkForm() {

                let {firstName, lastName, newPassword} = $scope.userData;

                if (firstName !== '' && lastName !== '' && newPassword !== '') {
                    return verifyPassword()
                }

                toast("The fields cannot be empty");

                return false
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

            function updateUser() {

                if (checkForm()) {

                    $scope.userData.password = $scope.userData.newPassword;

                    $NxApi.users
                        .update($scope.userData)
                        .then(() => {
                            toast('The user was update');

                        })
                        .catch((error) => {
                            console.log(error)
                        })
                }

            }

            init();

            $NxApi.setAfterLogin(init);

        }]);
})();