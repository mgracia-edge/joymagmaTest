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
        .controller("sCategoriesDetailCtrl", ['$scope', '$interval', '$routeParams', '$NxApi', '$q', '$location', '$mdDialog', controller]);

    function controller($scope, $interval, $routeParams, $NxApi, $q, $location, $mdDialog) {

        $scope.isNew = $routeParams.id === "new";
        $scope.categoryData = {
            name: '',
            descriptionShort: '',
            descriptionLong: '',
            enabled: false
        };

        $scope.updateCategory = updateCategory;
        $scope.removeCategory = removeCategory;

        function init() {
            if (!$scope.isNew) {
                $NxApi.categories
                    .read({_id: $routeParams.id})
                    .then((category) => {
                        $scope.categoryData = category[0];
                    })
                    .catch((error) => {
                        $location.path("/s/ott/categories");
                        $scope.$parent.toast('The category doesn\'t exist');

                    })
            }

        }

        function checkForm() {

            let {name, descriptionShort, descriptionLong} = $scope.categoryData;

            if (name !== '' && descriptionShort !== '' && descriptionLong !== '' ) {
                return true
            }

            $scope.$parent.toast("The fields cannot be empty");

            return false
        }

        function removeCategory() {

            dialog_alert()
                .then(() => {
                    $location.path('/s/ott/categories');
                }).catch((error) => {
                $scope.$parent.toast(error.message)
            })
        }

        function dialog_alert() {

            let title = 'Remove Category';
            let description = 'You are sure you want to delete the current category?';
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
                        $NxApi.categories
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

        function updateCategory() {
            if (checkForm()) {

                $scope.loading = true;

                if ($scope.isNew) {

                    $NxApi.categories
                        .create($scope.categoryData)
                        .then(() => {
                            $scope.$parent.toast('The category was created');
                            $scope.loading = false;
                            $location.path("/s/ott/categories");

                        })
                        .catch((error) => {
                            console.log(error);
                            $scope.$parent.toast(error.message);
                            $scope.loading = false;
                        })

                } else {
                    $NxApi.categories
                        .update($scope.categoryData)
                        .then(() => {
                            $scope.$parent.toast('The category was update');
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