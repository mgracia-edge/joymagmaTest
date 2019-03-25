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
            $scope.title = '';
            $scope.dataAvProfile = {};
            $scope.templateUrl = '/res/layout/fragment_config_avprofiles.html';

            $scope.selectTab = selectTab;

            $scope.detailsProfile = detailsProfile;
            $scope.newProfile = newProfile;
            $scope.updateProfile = updateProfile;

            function init() {

                selectTab('avprofiles');

                _updateProfileTable();
            }

            function selectTab(opt) {

                if(opt === 'domains'){
                    $scope.title = 'Domains';
                    $scope.templateUrl = '/res/layout/fragment_config_domains.html'
                }else if(opt === 'avprofiles'){
                    $scope.title = 'Av Profiles';
                    $scope.templateUrl = '/res/layout/fragment_config_avprofiles.html'
                }

                document.querySelector('.config__tabs div')

            }

            function detailsProfile(profile){

                $NxApi.avProfiles.read({
                    id: profile._id
                }).then((data)=>{
                    console.log(data.avProfiles[0])
                    $scope.title = 'Av Profile Details';
                    $scope.templateUrl = '/res/layout/fragment_config_avprofiles_detail.html';
                    $scope.dataAvProfile = data.avProfiles[0];
                })

            }

            function newProfile(){
                $scope.title = 'New Av Profile';
                $scope.templateUrl = '/res/layout/fragment_config_avprofiles_detail.html';
                $scope.dataAvProfile = {
                    name:'',
                    description:'',
                    dvr:'',
                    aesEncryption:'',
                    profile:'',
                    encode:'',
                    chunkSize:'',
                    fps:'',
                    keyRate:''
                };
            }

            function updateProfile(id){

                if(_checkProfileForm()){
                    if(id){
                        $NxApi.avProfiles.update($scope.dataAvProfile).then((data)=>{
                            console.log(data);
                            _updateProfileTable();
                        })
                    }else{

                    }
                }else{
                    $scope.$parent.toast("The fields cannot be empty");
                }


            }

            function _updateProfileTable(){
                $NxApi.avProfiles.read().then((data)=>{
                    $scope.avProfiles = data.avProfiles;
                })
            }

            function _checkProfileForm(){

                let {name,description,dvr,aesEncryption,profile,encode,chunkSize,fps,keyRate} = $scope.dataAvProfile;

                if(
                    name !== '' &&
                    description !== '' &&
                    dvr !== '' &&
                    aesEncryption !== '' &&
                    encode !== '' &&
                    chunkSize !== '' &&
                    fps !== '' &&
                    keyRate !== '' &&
                    profile !== ''
                ){
                    return true;
                }

                return false;
            }



            $NxApi.setAfterLogin(init);

        }]);
})();