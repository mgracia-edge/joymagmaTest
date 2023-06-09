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
        .controller("sCategoriesCtrl", ['$scope', '$interval', '$NxApi', '$location'
            , function ($scope, $interval, $NxApi, $location) {

                $scope.search = '';
                $scope.categories = [];
                $scope.channelDetails = channelDetails;
                $scope.customFilter = customFilter;

                function init() {

                    $NxApi.categories
                        .read({})
                        .then((channels) => {
                            $scope.categories = channels;
                        })
                        .catch((error) => {
                            console.log(error);

                        })
                }

                function channelDetails(category) {
                    $location.path('/s/ott/categories/' + category._id)
                }

                function customFilter() {
                    return function (item) {

                        if($scope.search === '') return true;

                        return !item.name.toLowerCase().indexOf($scope.search.toLowerCase()) ||
                            !item.channelEPGId.toLowerCase().indexOf($scope.search.toLowerCase()) ||
                            !item.entryPoint.streamKey.toLowerCase().indexOf($scope.search.toLowerCase())
                    }
                }

                $NxApi.setAfterLogin(init);

            }]);
})();