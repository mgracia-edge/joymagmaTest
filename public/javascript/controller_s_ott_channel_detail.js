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
        .controller("sOttChannelDetailCtrl", ['$scope', '$interval', '$routeParams', '$NxApi', '$q', '$location', '$mdDialog', controller]);

    function controller($scope, $interval, $routeParams, $NxApi, $q, $location, $mdDialog) {

        $scope.isNew = $routeParams.id === "new";
        $scope.channelData = {
            name: '',
            descriptionShort: '',
            channelEPGId: '',
            descriptionLong: '',
            poster: ''
        };

        $scope.uploadImage = uploadImage;
        $scope.getUrlPoster = getUrlPoster;
        $scope.updateChannel = updateChannel;
        $scope.removeChannel = removeChannel;

        function init() {
            if (!$scope.isNew) {
                $NxApi.channels
                    .read({_id: $routeParams.id})
                    .then((channel) => {
                        $scope.channelData = channel[0];
                    })
                    .catch((error) => {
                        $location.path("/s/ott/channel");
                        $scope.$parent.toast('The channel not exist');

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
                    update: true,
                    url: img
                }];
            }).catch((error) => {
                $scope.$parent.toast(error);
            })
        }

        function checkForm() {

            let {name, descriptionShort, channelEPGId, descriptionLong} = $scope.channelData;

            if (name !== '' && descriptionShort !== '' && channelEPGId !== '' && descriptionLong !== '') {
                return true
            }

            $scope.$parent.toast("The fields cannot be empty");

            return false
        }

        function removeChannel() {

            dialog_alert()
                .then(() => {
                    $location.path('/s/ott/channel');
                }).catch((error) => {
                $scope.$parent.toast(error.message)
            })
        }

        function dialog_alert() {

            let title = 'Remove Channel';
            let description = 'You are sure to delete the current Channel?';
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
                        $NxApi.channels
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

        function updateChannel() {
            if (checkForm()) {

                $scope.loading = true;

                if ($scope.isNew) {

                    $NxApi.channels
                        .create($scope.channelData)
                        .then(() => {
                            $scope.$parent.toast('The channel was created');
                            $scope.loading = false;
                            $location.path("/s/ott/channel");

                        })
                        .catch((error) => {
                            console.log(error);
                            $scope.$parent.toast(error.message);
                            $scope.loading = false;
                        })

                } else {
                    $NxApi.channels
                        .update($scope.channelData)
                        .then(() => {
                            $scope.$parent.toast('The channel was update');
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