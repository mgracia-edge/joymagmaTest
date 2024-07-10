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
        .controller("sRadioDetailsCtrl", ['$scope', '$interval', '$routeParams', '$NxApi', '$q', '$location', '$mdDialog', controller]);

    function controller($scope, $interval, $routeParams, $NxApi, $q, $location, $mdDialog) {
        $scope.isNew = $routeParams.id === "new";
       
        $scope.radioData = {
            name: '',
            priority: null,
            enabled: false,
            logo: '',
            background: '',
            url : '',
        };

        $scope.initialPoster = {
            logo : '',
            background : ''
        }
        
        $scope.uploadImage = uploadImage;
        $scope.uploadImageLogo = uploadImageLogo
        $scope.getUrlLogo = getUrlLogo;
        $scope.getUrlBackground = getUrlBackground
        $scope.back = back;


        $scope.updateRadio = updateRadio;
        $scope.removeBanner = removeBanner;


        function init() {
            if (!$scope.isNew) {
                $NxApi.radios
                    .read({_id: $routeParams.id})
                    .then((radio) => {
                        $scope.radioData = radio;
                        $scope.initialPoster.logo = radio[0].logo
                        $scope.initialPoster.background = radio[0].background
                    })
                    .catch((error) => {
                        $scope.$parent.toast('The radio doesn\'t exist');
                    })
            }
        }

        function getUrlLogo(channel) {
            let imageUrl = ''
            if (channel) {
                imageUrl = channel.logo
            }
            return {'background-image': 'url(' + imageUrl + ')'}
        }

        function getUrlBackground(channel) {
            let imageUrl = ''
            if (channel) {
                imageUrl = channel.background
            }
            
            return {'background-image': 'url(' + imageUrl + ')'}
        }

        function _getImage(imgType) {
            return $q((resolve, reject) => {
                let file = document.createElement('input')
                file.accept = 'image/*';
                
                let maxSize = 0; //kb
                let width = 0; //px
                let height = 0; //px

                // switch (imgType) {
                //     case 'logo':
                //         maxSize = 200;
                //         width = 800;
                //         height = 800;                        
                //         break;
                //     case 'background':
                //         maxSize = 2048;
                //         width = 2560;
                //         height = 1440;                        
                //         break;
                //     default:
                //         break;
                // }

                file.type = 'file';
                file.click();

                file.addEventListener('change', function () {

                    // if (file.files[0].size / 1000 > maxSize) {
                    //     reject(`The image can not be larger than ${maxSize}kb`)
                    // }

                    //check the size
                    var fileObj = file.files[0];
                    var img;
                    var _URL = window.URL || window.webkitURL;
                    img = new Image();
                    var objectUrl = _URL.createObjectURL(fileObj);
                    img.onload = function () {
                        _URL.revokeObjectURL(objectUrl);
                        // if(this.width != width || this.height != height){
                        //     reject(`The image must be  w:${width}px and h:${height}px`);
                        // }

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
            _getImage('background').then((img) => {
                $scope.initialPoster.background = img
                
            }).catch((error) => {
                $scope.$parent.toast(error);
            })
        }

        function uploadImageLogo() {
            _getImage('logo').then((img) => {
                $scope.initialPoster.logo = img
                
            }).catch((error) => {
                $scope.$parent.toast(error);
            })
        }

        function checkForm() {

            let { name, priority, logo, background, enabled} = $scope.radioData[0];    

            if(priority < 1){
                $scope.$parent.toast("Priority must be greater than 0.");
                return false
            }

            if (name.length < 0) {
                $scope.$parent.toast("Name is required");
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

        function updateRadio() {
            if (checkForm()) {
                $scope.loading = true;
                // controlar background y logo, antes de enviar
                console.log('Inicial: ', JSON.stringify( $scope.initialPoster))
                console.log('Update: ', JSON.stringify( $scope.radioData[0]))

                
                    $NxApi.radios
                        .update($scope.radioData[0])
                        .then(() => {
                            $scope.$parent.toast('The radio was update');
                            $scope.loading = false;
                        })
                        .catch((error) => {
                            
                            $scope.$parent.toast(error.message);
                            $scope.loading = false;

                        })
            }
        }

        function back(){
            $location.path("/s/ott/radios");
        }

        $NxApi.setAfterLogin(init);


    }
})();