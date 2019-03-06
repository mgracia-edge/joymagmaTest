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
        .controller("MainCtrl", ['$scope', '$NxApi', '$NxNav', '$location', function ($scope, $NxApi, $NxNav, $location) {

            // Scope Properties

            $scope.navPanel = $NxNav.navPanel;
            $scope.mainBar = $NxNav.mainBar;


            // Methods Declaration

            $scope.userPicture = userPicture;
            $scope.userName = userName;
            $scope.navAction = navAction;
            $scope.currentAccount = currentAccount;
            $scope.logOut = logOut;
            $scope.accessProfile = accessProfile;

            // Implementation

            function init() {

                $NxApi.login().then(() => {

                    if ($location.path() === "/login") {
                        $location.path("/")
                    }

                }).catch((e) => {
                    console.log(2, e);
                    $location.path("/login");
                });

            }

            function userPicture() {
                const user = $NxApi.getUser();

                if (user && user.photo.url) {
                    return user.photo.url
                } else {
                    return "/res/drawable/ph_user.jpg"
                }
            }

            function userName() {
                const user = $NxApi.getUser();

                if (user) {
                    return user.firstName + " " + user.lastName
                } else {
                    return "..."
                }
            }

            function navAction(item) {
                $location.path(item.path);
            }

            function currentAccount() {
                return $NxNav.navPanel.currentAccount;
            }

            function logOut(){
                localStorage.clear();
                window.location = "/login"
            }

            function accessProfile(){
                $location.path("/s/user-profile")
            }


            init();

        }]);
})();