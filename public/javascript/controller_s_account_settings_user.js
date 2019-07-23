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
        .controller("sAccountSettingsUserCtrl",
            ['$scope', '$NxApi', '$mdToast', '$location', '$routeParams', '$q', '$mdDialog',
                function ($scope, $NxApi, $mdToast, $location, $routeParams, $q, $mdDialog) {

                    const users_permissions = {
                        USER_ADMIN: "user.admin",
                        PRODUCTS_WRITE: "products.write",
                        PRODUCTS_READ: "products.read",
                        CHANNELS_WRITE: "channels.write",
                        CHANNELS_READ: "channels.read",
                        STATS_ACCESS: "stats.access",
                        SUBSCRIBERS_READ: "subscribers.read",
                    };

                    $scope.isNew = $routeParams.user_id === "new";
                    $scope.user = {};
                    $scope.accountName = '';
                    $scope.users_permissions = [
                        {
                            value: users_permissions.CHANNELS_READ,
                            state: false
                        },
                        {
                            value: users_permissions.CHANNELS_WRITE,
                            state: false
                        },
                        {
                            value: users_permissions.PRODUCTS_READ,
                            state: false
                        },
                        {
                            value: users_permissions.PRODUCTS_WRITE,
                            state: false
                        },
                        {
                            value: users_permissions.STATS_ACCESS,
                            state: false
                        },
                        {
                            value: users_permissions.SUBSCRIBERS_READ,
                            state: false
                        },
                        {
                            value: users_permissions.USER_ADMIN,
                            state: false
                        }
                    ];
                    $scope.loading = false;

                    $scope.updateUser = updateUser;
                    $scope.uploadImage = uploadImage;
                    $scope.getUrlProfilePhoto = getUrlProfilePhoto;
                    $scope.dialog_changePassword = dialog_changePassword;
                    $scope.dialog_alert = dialog_alert;
                    $scope.logAsUser = logAsUser;

                    function init() {
                        if (!$scope.isNew) {
                            let user_id = $routeParams.user_id;

                            if (user_id) {
                                $NxApi.users.read({_id: user_id}).then(({users}) => {
                                    $scope.user = users[0];
                                    for (let permission of $scope.users_permissions) {
                                        if ($scope.user.permissions.includes(permission.value)) {
                                            permission.state = true;
                                        }
                                    }
                                });

                            }
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

                    function checkForm() {

                        let {firstName, lastName, email,password} = $scope.user;

                        if (
                            typeof firstName !== 'undefined' &&
                            firstName !== '' &&
                            typeof lastName !== 'undefined' &&
                            lastName !== '' &&
                            typeof email !== 'undefined'
                            && email !== ''
                        ) {

                            if ($scope.isNew) {
                                if (password !== 'undefined' && password !== '') {
                                    return true
                                }
                            }else{
                                return true
                            }
                        }

                        toast("The fields cannot be empty");

                        return false
                    }

                    function updateUser() {

                        if (checkForm()) {

                            $scope.loading = true;

                            let data = {
                                _id: $scope.user._id,
                                firstName: $scope.user.firstName,
                                lastName: $scope.user.lastName,
                                permissions: _getPermissions(),
                                email: $scope.user.email
                            };

                            if($scope.user.photo){
                                data["photo"] = $scope.user.photo;
                            }

                            if ($scope.isNew) {

                                data.password = $scope.user.password;

                                $NxApi.users
                                    .create(data)
                                    .then(() => {
                                        toast('The user was create');
                                        $scope.loading = false;
                                        $location.path("/s/account/settings/users");

                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        $scope.loading = false;
                                    })

                            } else {

                                $NxApi.users
                                    .update(data)
                                    .then(() => {
                                        toast('The user was update');
                                        $scope.loading = false;
                                        if($scope.user.photo) $scope.user.photo.update = false;

                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        $scope.loading = false;
                                    })
                            }

                        }

                    }

                    function getUrlProfilePhoto(user) {
                        if (user.photo && user.photo.url) {
                            return user.photo.url
                        }

                        return '/res/drawable/ph_user.jpg'
                    }

                    function _getPermissions() {
                        let user_permissions = [];
                        for (let permission of $scope.users_permissions) {
                            if (permission.state) user_permissions.push(permission.value);
                        }
                        return user_permissions;
                    }

                    function dialog_changePassword() {

                        let title = 'Reset Password';
                        let templateUrl = "/res/layout/dialog_change_password.html";
                        let userId = $scope.user._id;

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

                    function dialog_alert() {

                        let title = 'Remove user';
                        let description = 'You are sure to delete the current user?';
                        let templateUrl = "/res/layout/dialog_alert.html";
                        let userId = $scope.user._id;

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
                                $scope.description = description;
                                $scope.userId = userId;
                                $scope.loading = false;

                                $scope.cancel = cancel;
                                $scope.ok = ok;

                                function init() {

                                }

                                function cancel() {
                                    $mdDialog.cancel();
                                }

                                function ok() {
                                    $scope.loading = true;
                                    $NxApi.users
                                        .delete({
                                            _id: userId
                                        })
                                        .then(() => {
                                            toast('user removed');
                                            $scope.loading = false;
                                            $mdDialog.hide();
                                            $location.path('/s/account/settings/users');

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
                            $scope.user.photo = {
                                update:true,
                                url:img
                            };
                        }).catch((error) => {
                            toast(error);
                        })
                    }

                    function logAsUser(user){
                        $NxApi.loginAsUser(user.email,user.authentication.password).then(()=>{
                            window.location = "/";
                        })
                    }

                    init();

                    $NxApi.setAfterLogin(init);

                }]);
})();