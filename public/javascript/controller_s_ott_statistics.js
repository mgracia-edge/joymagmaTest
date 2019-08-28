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
        .controller("sOttStatisticsCtrl", ['$scope', '$NxApi', '$mdToast', '$location', function ($scope, $NxApi, $mdToast, $location) {


            $scope.sectionName = "Choose a section";

            $scope.sections = [
                {
                    name: "Subscribers",
                    icon:"/res/drawable/ic_users.svg",
                    controller: SubscribersCtrl
                }, {
                    name: "Viewing",
                    icon:"/res/drawable/ic_viewing.svg",
                    controller: ViewingCtrl
                }, {
                    name: "Devices",
                    icon:"/res/drawable/ic_devices.svg",
                    controller: DevicesCtrl
                }
            ];

            $scope.startSection = startSection;

            function init() {
                startSection($scope.sections[0]);
            }

            let cleanUp = (_) => {
            };

            function startSection(section) {

                if (typeof section.controller === "function") {
                    cleanUp();
                    $scope.currentSection = section;
                    section.controller();
                }

            }


            function SubscribersCtrl() {
                cleanUp = (_) => {
                    // Setup a new Clean Up Function in case other section is choose.


                }

            }

            function ViewingCtrl() {
                cleanUp = (_) => {
                    // Setup a new Clean Up Function in case other section is choose.


                }

            }

            function DevicesCtrl() {
                cleanUp = (_) => {
                    // Setup a new Clean Up Function in case other section is choose.


                }

            }

            // End of code

            $NxApi.setAfterLogin(init);

        }]);
})();