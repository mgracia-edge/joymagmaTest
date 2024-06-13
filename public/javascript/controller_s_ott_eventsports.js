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
        .controller("sEventSportsCtrl", ['$scope', '$interval', '$NxApi', '$location'
            , function ($scope, $interval, $NxApi, $location) {

                $scope.search = '';
                $scope.events = null;
                $scope.eventsInitials = null
                $scope.updateEvents = updateEvents;
                $scope.compareObjects = compareObjects;
                // $scope.banners = [];
                // $scope.bannerDetails = bannerDetails;
                // $scope.customFilter = customFilter;
                // $scope.isBetween = isBetween;
                // $scope.backBanner = backBanner;

                
                
                function init() {
                    $NxApi.eventSports
                        .read({})
                        .then((events) => {
                            
                            $scope.events = events;
                            $scope.eventsInitials = events;
                        })
                        .catch((error) => {
                            console.log(error);
                        })
                    
                    
                }
                // function backBanner(){
                //     $location.path("/s/ott/eventsports");
                // }

                
                function compareObjects(){
                    var _ = require('lodash')
                    // comparo Objetos
                    console.log(_.isEqual(events,eventSports))

                }
                function updateEvents(eventSports){

                    $NxApi.eventSports
                        .update(eventSports)
                        .then(() => {
                            init()
                            // $location.path("/s/ott/eventsports");
                        })
                        .catch((error) => {
                            console.log(error);
                        })
                }

                $NxApi.setAfterLogin(init);

            }]);
})();