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
        .controller("sUserProfileCtrl", ['$scope', '$NxApi', '$mdToast', '$location', '$q', '$mdDialog', function ($scope, $NxApi, $mdToast, $location, $q, $mdDialog) {

            $scope.userData = {};
            $scope.loading = false;

            $scope.updateUser = updateUser;
            $scope.uploadImage = uploadImage;
            $scope.dialog_changePassword = dialog_changePassword;


            function init() {

                let user = $NxApi.getUser();

                if (user) {
                    $scope.userData = {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        account: user.account,
                        photo: {
                            url: user && user.photo && user.photo.url ? user.photo.url : "/res/drawable/ph_user.jpg",
                            update: false
                        }
                    };
                }


            }

            function checkForm() {

                let {firstName, lastName} = $scope.userData;

                if (firstName !== '' && lastName !== '') {
                    return true
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

                    let data = {
                        _id: $scope.userData._id,
                        firstName: $scope.userData.firstName,
                        lastName: $scope.userData.lastName,
                        photo: $scope.userData.photo
                    };

                    $scope.loading = true;

                    $NxApi.users
                        .update(data)
                        .then(() => {
                            toast('The user was update');
                            $scope.loading = false;

                        })
                        .catch((error) => {
                            console.log(error);
                            $scope.loading = false;
                        })
                }

            }

            function _getImage() {
                return $q((resolve, reject) => {
                    let file = document.createElement('input');
                    let maxSize = 500; //kb
                    file.type = 'file';
                    file.click();

                    file.addEventListener('change', function () {

                        if (file.files[0].size / 1000 > maxSize) {
                            reject(`The image can not be larger than ${maxSize}kb`)
                        }

                        let reader = new FileReader();

                        reader.onloadend = function () {
                            resolve(reader.result)
                        };

                        reader.readAsDataURL(file.files[0]);
                    })
                })
            }

            function uploadImage() {
                _getImage().then((img) => {
                    $scope.userData.photo.update = true;
                    $scope.userData.photo.url = img;
                }).catch((error) => {
                    toast(error);
                })
            }

            function dialog_changePassword() {

                let title = 'Change Password';
                let templateUrl = "/res/layout/dialog_change_password.html";
                let userId = $scope.userData._id;

                return $q((resolve, reject) => {

                    let dialog = {
                        templateUrl: templateUrl,
                        parent: angular.element(document.body),
                        escapeToClose: true,
                        clickOutsideToClose: true,
                        controller: dialogController
                    };

                    $mdDialog.show(dialog).then(resolve, reject);

                    function dialogController($scope, $mdDialog) {

                        $scope.title = title;
                        $scope.userId = userId;
                        $scope.newPassword = '';
                        $scope.newPasswordVerify = '';
                        $scope.loading = false;

                        $scope.cancel = cancel;
                        $scope.save = save;
                        $scope.verifyPassword = verifyPassword;

                        function init() {

                        }

                        function cancel() {
                            $mdDialog.cancel();
                        }

                        function verifyPassword() {

                            return ($scope.newPassword === '' && $scope.newPasswordVerify === '') || $scope.newPassword !== $scope.newPasswordVerify
                        }

                        function save() {
                            $scope.loading = true;
                            $NxApi.users
                                .update({
                                    _id: userId,
                                    password: $scope.newPassword
                                })
                                .then(() => {
                                    toast('The password was update');
                                    $scope.loading = false;
                                    $mdDialog.hide();

                                })
                                .catch((error) => {
                                    console.log(error);
                                    $scope.loading = false;
                                })

                        }

                        init();
                    }

                });

            }

            init();

            $NxApi.setAfterLogin(init);

        }]);
})();