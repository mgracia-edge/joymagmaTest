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
        .controller("sOttConfigCtrl", ['$scope', '$NxApi', '$mdToast', '$location', function ($scope, $NxApi, $mdToast, $location) {

            $scope.ottConfigurations = {};

            $scope.save = save;

            function save() {
                $scope.loading = true;

                $NxApi.ottConfigurations.update({
                    ...$scope.keepWatchingWarning
                }).then(data => {

                    $scope.loading = false;
                    $scope.$parent.toast('The OTT Configurations was update');
                }).catch((error) => {
                    console.log(error);
                    $scope.$parent.toast(error.message);
                    $scope.loading = false;

                })
            }

            function init() {

                $NxApi.ottConfigurations.read().then(data => {
                    console.log(data)
                })

            }

            $NxApi.setAfterLogin(init);

        }]);
})();