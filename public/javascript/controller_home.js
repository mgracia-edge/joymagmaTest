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
        .controller("HomeCtrl", ['$scope', function($scope) {

            $scope.channel = {
                logo:'https://is5-ssl.mzstatic.com/image/thumb/Purple118/v4/e0/4d/be/e04dbe0a-748d-ba79-bae0-1c0b23c937a5/source/512x512bb.jpg',
                stats: [{

                    timestamp: Date.parse(new Date()),
                    concurrency: 2121,
                    users: 2313

                }],
                name: "Vivo 1",
                online: true,
                publishing: true
            };

            $scope.channel1 = {
                logo:'https://is5-ssl.mzstatic.com/image/thumb/Purple118/v4/e0/4d/be/e04dbe0a-748d-ba79-bae0-1c0b23c937a5/source/512x512bb.jpg',
                stats: [{

                    timestamp: Date.parse(new Date()),
                    concurrency: 2121,
                    users: 2313

                }],
                name: "Vivo 2",
                online: false,
                publishing: true
            };

            console.log($scope)

        }]);
})();