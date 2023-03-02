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
        .controller("sBannersDetailCtrl", ['$scope', '$interval', '$routeParams', '$NxApi', '$q', '$location', '$mdDialog', controller]);

    function controller($scope, $interval, $routeParams, $NxApi, $q, $location, $mdDialog) {

        $scope.isNew = $routeParams.id === "new";
        $scope.bannerData = {
            name: '',
            duration: 1,
            start : new Date('YYYY-MM-DDTHH:mm:ss'),
            end : new Date('YYYY-MM-DDTHH:mm:ss'),
            enabled: false,
            poster :[]
        };

        $scope.uploadImage = uploadImage;
        $scope.getUrlPoster = getUrlPoster;
        $scope.updateBanner = updateBanner;
        $scope.removeBanner = removeBanner;

        function init() {
            if (!$scope.isNew) {
                $NxApi.banners
                    .read({_id: $routeParams.id})
                    .then((banner) => {
                        $scope.bannerData = banner[0];
                    })
                    .catch((error) => {
                        $location.path("/s/ott/banners");
                        $scope.$parent.toast('The banner doesn\'t exist');

                    })
            }

        }

        function getUrlPoster(channel) {
            if (channel && channel.poster && channel.poster.length) {
                return {'background-image': 'url(' + channel.poster[0].url + ')'}
            }

            return {'background-image': 'url(/res/drawable/ph_noimage.png)'}
        }

        function _getImage() {
            return $q((resolve, reject) => {
                let file = document.createElement('input')
                file.accept = 'image/*';
                let maxSize = 500; //kb
                let width = 1920; //px
                let height = 150; //px
                file.type = 'file';
                file.click();

                file.addEventListener('change', function () {

                    if (file.files[0].size / 1000 > maxSize) {
                        reject(`The image can not be larger than ${maxSize}kb`)
                    }

                    //check the size
                    var fileObj = file.files[0];
                    var img;
                    var _URL = window.URL || window.webkitURL;
                    img = new Image();
                    var objectUrl = _URL.createObjectURL(fileObj);
                    img.onload = function () {
                        _URL.revokeObjectURL(objectUrl);
                        if(this.width != width || this.height != height){
                            reject(`The image must be  w:${width}px and h:${height}px`);
                        }

                        let reader = new FileReader();
                        reader.onloadend = function () {
                            resolve(reader.result)
                        };
                        reader.readAsDataURL(file.files[0]);
                        
                    };
                    img.src = objectUrl;
                })
            })
        }

        function uploadImage() {
            _getImage().then((img) => {
                $scope.bannerData.poster = [{
                    update: true,
                    url: img
                }];
            }).catch((error) => {
                $scope.$parent.toast(error);
            })
        }

        function checkForm() {

            let { name, start, end, duration} = $scope.bannerData;    

            if (  name == '' || duration == '' || isNaN(start.getTime()) || isNaN(end.getTime()) ) {
                $scope.$parent.toast("The fields cannot be empty");
                return false
            }

            if(duration < 1){
                $scope.$parent.toast("Duration must be greater than 0.");
                return false
            }

            if(end < start){
                $scope.$parent.toast("End cann't be greater than start date.");
                return false    
            }

            if(end < new Date()){
                $scope.$parent.toast("End cann't be in the past.");
                return false    
            }

            return true
        }

        function removeBanner() {

            dialog_alert()
                .then(() => {
                    $location.path('/s/ott/banners');
                }).catch((error) => {
                $scope.$parent.toast(error.message)
            })
        }

        function dialog_alert() {

            let title = 'Remove Banner';
            let description = 'You are sure you want to delete the current banner?';
            let templateUrl = "/res/layout/dialog_alert.html";
            let channelId = $routeParams.id;

            return $q((resolve, reject) => {

                let dialog = {
                    templateUrl: templateUrl,
                    parent: angular.element(document.body),
                    escapeToClose: true,
                    clickOutsideToClose: true,
                    controller: dialogController
                };

                $mdDialog.show(dialog).then(resolve, reject);

                function dialogController($scope, $mdDialog, $location) {

                    $scope.title = title;
                    $scope.description = description;
                    $scope.channelId = channelId;
                    $scope.loading = false;

                    $scope.cancel = cancel;
                    $scope.ok = ok;

                    function init() {

                    }

                    function cancel() {
                        $mdDialog.cancel();
                    }

                    function ok() {
                        $scope.loading = true;
                        $NxApi.banners
                            .delete({
                                _id: channelId
                            })
                            .then(() => {
                                $mdDialog.hide();
                            })
                            .catch((error) => {
                                $mdDialog.cancel(error);
                                $scope.loading = false;
                            })

                    }

                    init();
                }

            });

        }

        function updateBanner() {
            if (checkForm()) {

                $scope.loading = true;

                if ($scope.isNew) {

                    $NxApi.banners
                        .create($scope.bannerData)
                        .then(() => {
                            $scope.$parent.toast('The banner was created');
                            $scope.loading = false;
                            $location.path("/s/ott/banners");

                        })
                        .catch((error) => {
                            console.log(error);
                            $scope.$parent.toast(error.message);
                            $scope.loading = false;
                        })

                } else {
                    $NxApi.banners
                        .update($scope.bannerData)
                        .then(() => {
                            $scope.$parent.toast('The banner was update');
                            $scope.loading = false;
                            if ($scope.channelData.poster) $scope.channelData.poster.update = false;

                        })
                        .catch((error) => {
                            console.log(error);
                            $scope.$parent.toast(error.message);
                            $scope.loading = false;

                        })

                }

            }
        }

        $NxApi.setAfterLogin(init);


    }
})();