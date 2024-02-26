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
        .controller("sOttEPGMonitorCtrl", ['$scope', '$NxApi', '$mdToast', '$location', function ($scope, $NxApi, $mdToast, $location) {

            $scope.channels = [];
            $scope.programmes = [];
            $scope.loading = true;
            $scope.order = 'channelEPGId';

            $scope.sortBy = sortBy;
            $scope.getIconChannel = getIconChannel;

            function init() {

                $NxApi.programmes.read({}).then((programmes) => {

                    $scope.programmes = programmes;

                    $NxApi.programmes.channels({}).then((channelsEPGId) => {

                        $NxApi.channels.read({channelEPGId: channelsEPGId}).then((channels) => {

                            $scope.channels = channels;
                            $scope.loading = false;
                        })
                    });
                })

            }

            function sortBy(order){
                $scope.order = order;
            }

            function getIconChannel(channelEPGId) {
                let value = '/res/drawable/ph_noimage.png';
                let out = false;
                for (let channel of $scope.channels) {

                    if (out) break;

                    if (channelEPGId === parseInt(channel.channelEPGId)) {
                        out = true;
                        value = channel.poster[0].url;
                    }
                }

                return value
            }

            $NxApi.setAfterLogin(init);

        }]);
})();