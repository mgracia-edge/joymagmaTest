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
        .controller("sOttProductsCtrl",
            ['$scope', '$NxApi', '$mdToast', '$location','$q','$mdDialog',
                function ($scope, $NxApi, $mdToast, $location,$q,$mdDialog) {

            $scope.products = [];

            $scope.details = details;
            $scope.shortDescription = shortDescription;
            $scope.remove = remove;

            function init() {
                _updateTable();

            }

            function details(product) {
                $location.path('/s/ott/products/' + product._id)
            }

            function shortDescription(text){
                return typeof text !== 'undefined' ? text.substring(0,20) + "..."  : '';
            }

            function dialog_alert(product) {

                let title = 'Remove package';
                let description = 'You are sure to delete the selected package?';
                let templateUrl = "/res/layout/dialog_alert.html";
                let productId = product._id;

                return $q((resolve, reject) => {

                    let dialog = {
                        templateUrl: templateUrl,
                        parent: angular.element(document.body),
                        escapeToClose: true,
                        clickOutsideToClose: true,
                        controller: dialogController
                    };

                    $mdDialog.show(dialog).then(resolve, reject);

                    function dialogController($scope, $mdDialog) {

                        $scope.title = title;
                        $scope.description = description;
                        $scope.productId = productId;
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
                            $NxApi.products
                                .delete({
                                    _id: productId
                                })
                                .then(() => {
                                    $scope.loading = false;
                                    $mdDialog.hide();


                                })
                                .catch((error) => {
                                    console.log(error);
                                    $scope.loading = false;
                                })

                        }

                        init();
                    }

                });

            }

            function remove(product){
                dialog_alert(product).then(()=>{
                    $scope.$parent.toast('user removed');
                    _updateTable();
                })
            }

            function _updateTable(){
                $NxApi.products.read({}).then((products) => {
                    $scope.products = products;

                    for(let i=0;i<products.length;i++){

                        let product = products[i];

                        $NxApi.channels.read({
                            _id:product.channels
                        }).then((channels) => {
                            product.channels = channels;
                        });
                    }

                });
            }

            $NxApi.setAfterLogin(init);
            init()

        }]);
})();