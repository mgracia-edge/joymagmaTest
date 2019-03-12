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
        .controller("sAccountSettingsUsersCtrl",
            ['$scope', '$NxApi', '$mdToast', '$location','$q','$mdDialog',
            function ($scope, $NxApi, $mdToast, $location,$q,$mdDialog) {

            $scope.users = [];
            $scope.accountName = '';
            $scope.getUrlProfilePhoto = getUrlProfilePhoto;
            $scope.userDetails = userDetails;
            $scope.removeUser = removeUser;

            function init() {
                let user = $NxApi.getUser();

                if (user) {

                    $NxApi.getAccount(user.account).then((account) => {
                        $scope.accountName = account.name;
                        $NxApi.users.read({account: user.account}).then(({users}) => {
                            console.log(users);
                            $scope.users = users;
                        });
                    })

                }

            }

            function _updateTable(){
                let user = $NxApi.getUser();

                if (user) {

                    $NxApi.getAccount(user.account).then((account) => {
                        $scope.accountName = account.name;
                        $NxApi.users.read({account: user.account}).then(({users}) => {
                            $scope.users = users;
                        });
                    })

                }
            }

            function userDetails(user){
                $location.path('/s/account/settings/users/'+user._id)
            }

            function removeUser(user){

                dialog_alert(user).then(()=>{
                    toast('user removed');
                    _updateTable();
                })

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

            function dialog_alert(user) {

                let title = 'Remove user';
                let description = 'You are sure to delete the selected user?';
                let templateUrl = "/res/layout/dialog_alert.html";
                let userId = user._id;

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

            function getUrlProfilePhoto(user){
                if(user.photo && user.photo.url){
                    return user.photo.url
                }

                return '/res/drawable/ph_user.jpg'
            }

            init();

            $NxApi.setAfterLogin(init);

        }]);
})();