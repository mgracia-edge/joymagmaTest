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
        .controller("sAccountSettingsUsersCtrl", ['$scope', '$NxApi', '$mdToast', '$location', function ($scope, $NxApi, $mdToast, $location) {

            $scope.users = [];
            $scope.accountName = '';
            $scope.getUrlProfilePhoto = getUrlProfilePhoto;
            $scope.userDetails = userDetails;

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

            function userDetails(user){
                $location.path('/s/account/settings/users/'+user._id)
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