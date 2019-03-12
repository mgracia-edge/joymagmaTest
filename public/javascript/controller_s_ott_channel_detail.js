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
        .controller("sOttChannelDetailCtrl", ['$scope', '$interval', '$routeParams', '$NxApi','$q', controller]);

    function controller($scope, $interval, $routeParams, $NxApi, $q) {

        $scope.isNew = $routeParams.id === "new";
        $scope.channelData = {
            name:'',
            descriptionShort:'',
            channelEPGId:'',
            descriptionLong:'',
            poster:{
                url:''
            }
        };

        $scope.uploadImage = uploadImage;
        $scope.getUrlPoster = getUrlPoster;
        $scope.updateChannel = updateChannel;

        function init() {
            //console.log($scope.$parent.toast("hola"))
            if(!$scope.isNew){
                $NxApi.channels
                    .read({_id:$routeParams.id})
                    .then((channel) => {
                        console.log(channel);
                        $scope.channelData = channel[0];
                    })
                    .catch((error) => {
                        console.log(error);

                    })
            }

        }

        function getUrlPoster(channel) {
            if (channel && channel.poster && channel.poster.length) {
                return {'background-image':'url('+channel.poster[0].url+')'}
            }

            return {'background-image':'url(/res/drawable/ph_noimage.png)'}
        }

        function _getImage() {
            return $q((resolve, reject) => {
                let file = document.createElement('input');
                let maxSize = 500; //kb
                file.type = 'file';
                file.click();

                file.addEventListener('change', function () {

                    if (file.files[0].size / 1000 > maxSize) {
                        reject(`The image can not be larger than ${maxSize}kb`)
                    }

                    let reader = new FileReader();

                    reader.onloadend = function () {
                        resolve(reader.result)
                    };

                    reader.readAsDataURL(file.files[0]);
                })
            })
        }

        function uploadImage() {
            _getImage().then((img) => {
                $scope.channelData.poster = [{
                    update:true,
                    url:img
                }];
            }).catch((error) => {
                $scope.$parent.toast(error);
            })
        }

        function checkForm() {

            let {name, descriptionShort, channelEPGId,descriptionLong} = $scope.channelData;

            if (name !== '' && descriptionShort !== '' && channelEPGId !== '' && descriptionLong !== '') {
                return true
            }

            $scope.$parent.toast("The fields cannot be empty");

            return false
        }

        function updateChannel(){
            if(checkForm()){

                $scope.loading = true;

                if($scope.isNew){

                    $NxApi.channels
                        .create($scope.channelData)
                        .then(() => {
                            $scope.$parent.toast('The channel was created');
                            $scope.loading = false;
                            window.location = "/s/ott/channel";

                        })
                        .catch((error) => {
                            console.log(error);
                            $scope.loading = false;
                        })

                }else{
                    $NxApi.channels
                        .update($scope.channelData)
                        .then(() => {
                            $scope.$parent.toast('The channel was update');
                            $scope.loading = false;
                            if($scope.channelData.poster) $scope.channelData.poster.update = false;

                        })
                        .catch((error) => {
                            console.log(error);
                            $scope.loading = false;
                        })

                }

            }
        }

        $NxApi.setAfterLogin(init);
        init();

    }
})();