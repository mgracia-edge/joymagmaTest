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

            $scope.avProfiles = [];
            $scope.avProfileAction = '';
            $scope.dataAvProfile = {};
            $scope.templateUrl = '/res/layout/fragment_config_avprofiles.html';


            $scope.selectTab = selectTab;
            $scope.detailsProfile = detailsProfile;

            function init() {

                $NxApi.avProfiles.read().then((data)=>{
                    $scope.avProfiles = data.avProfiles;
                })
            }

            function selectTab(opt) {

                if(opt === 'domains'){
                    $scope.templateUrl = '/res/layout/fragment_config_domains.html'
                }else if(opt === 'avprofiles'){
                    $scope.templateUrl = '/res/layout/fragment_config_avprofiles.html'
                }

            }

            function detailsProfile(profile){

                $NxApi.avProfiles.read({
                    id: profile._id
                }).then((data)=>{
                    console.log(data.avProfiles[0])
                    $scope.avProfileAction = 'detail';
                    $scope.dataAvProfile = data.avProfiles[0];
                })

            }

            $NxApi.setAfterLogin(init);

        }]);
})();