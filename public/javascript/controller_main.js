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
        .controller("MainCtrl", ['$scope', ($scope) => {

            // Scope Properties

            $scope.user = {};

            // Methods Declaration

            $scope.getUserPicture = getUserPicture;

            // Implementation

            function init() {

            }

            function getUserPicture() {
                if ($scope.user && $scope.user.picture) {
                    return $scope.user.picture.url
                } else {
                    return "/res/drawable/ph_user.jpg"
                }
            }

            init();

        }]);
})();