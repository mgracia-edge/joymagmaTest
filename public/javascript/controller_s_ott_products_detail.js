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
        .controller("sOttProductsDetailCtrl", ['$scope', '$interval', '$routeParams', '$NxApi', '$NxDialogs', controller]);


    function controller($scope, $interval, $routeParams, $NxApi, $NxDialogs) {

        $scope.isNew = $routeParams.id === "new";

        $scope.productData = {
            channels: []
        };

        $scope.addChannel = addChannel;
        $scope.clearAllChannels = clearAllChannels;
        $scope.removeChannel = removeChannel;

        function init() {

        }


        function addChannel() {
            $NxDialogs.showChannelSelector().then((channel) => {
                for (let item of $scope.productData.channels) {
                    if (item._id === channel._id) {
                        return;
                    }
                }

                $scope.productData.channels.push(channel);
            })
        }

        function clearAllChannels() {
            $scope.productData.channels = [];
        }

        function removeChannel(channel) {

            console.log(channel);

            for (let i in $scope.productData.channels) {

                let item = $scope.productData.channels[i];

                if (item._id === channel._id) {
                    $scope.productData.channels.splice(i, 1);
                }
            }
        }

        $NxApi.setAfterLogin(init);
        init();

    }

})();