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
        .controller("sOttChannelCtrl", ['$scope', '$interval','$NxApi','$location'
            , function ($scope, $interval,$NxApi,$location) {

            $scope.channels = [];
            $scope.channelDetails = channelDetails;

            function init() {

                /*
                for (let i = 0; i < 50; i++) {
                    $scope.channels.push(channel("Vivo " + i))
                }


                function channel(name) {

                    let c = [{
                        timestamp: Date.now(),
                        concurrency: 0,
                        users: 0
                    }];

                    return {
                        logo: 'https://is5-ssl.mzstatic.com/image/thumb/Purple118/v4/e0/4d/be/e04dbe0a-748d-ba79-bae0-1c0b23c937a5/source/512x512bb.jpg',
                        stats: c,
                        name: name,
                        online: false,
                        publishing: false
                    }

                }

                */

                $NxApi.channels
                    .read({})
                    .then((channels) => {
                        console.log(channels);
                        $scope.channels = channels;
                    })
                    .catch((error) => {
                        console.log(error);

                    })
            }

            function channelDetails(channel){
                $location.path('/s/ott/channel/'+channel._id)
            }

            $NxApi.setAfterLogin(init);
            init();

        }]);
})();