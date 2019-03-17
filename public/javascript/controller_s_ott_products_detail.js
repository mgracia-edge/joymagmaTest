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
        .controller("sOttProductsDetailCtrl",
            ['$scope', '$interval', '$routeParams', '$NxApi', '$NxDialogs','$location','$q','$mdDialog', controller]);


    function controller($scope, $interval, $routeParams, $NxApi, $NxDialogs, $location,$q,$mdDialog) {

        $scope.isNew = $routeParams.id === "new";

        $scope.productData = {
            name:'',
            description:'',
            channels: []
        };

        $scope.addChannel = addChannel;
        $scope.clearAllChannels = clearAllChannels;
        $scope.removeChannel = removeChannel;
        $scope.update = update;
        $scope.remove = remove;

        function init() {
            if(!$scope.isNew){
                $NxApi.products.read({
                    _id:$routeParams.id
                }).then((products)=>{

                    let product = products[0];

                    $NxApi.channels.read({
                        _id:product.channels
                    }).then((channels)=>{

                        $scope.productData = {
                            id: product._id,
                            name: product.name,
                            description:product.description,
                            channels: channels
                        };

                    });




                });
            }


        }

        function addChannel() {
            $NxDialogs.showChannelSelector().then((channel) => {
                for (let item of $scope.productData.channels) {
                    if (item._id === channel._id) {
                        return;
                    }
                }

                $scope.productData.channels.push(channel);
            })
        }

        function clearAllChannels() {
            $scope.productData.channels = [];
        }

        function removeChannel(channel) {

            console.log(channel);

            for (let i in $scope.productData.channels) {

                let item = $scope.productData.channels[i];

                if (item._id === channel._id) {
                    $scope.productData.channels.splice(i, 1);
                }
            }
        }

        function update(){

            if(_checkFields()){

                if($scope.isNew){
                    $scope.loading = true;
                    $NxApi.products.create({
                        ...$scope.productData,
                        channels:$scope.productData.channels.map((item)=>item._id)
                    }).then(()=>{
                        $scope.$parent.toast('The product was created');
                        $scope.loading = false;
                        $location.path("/s/ott/products");
                    }).catch((error) => {
                        console.log(error);
                        $scope.$parent.toast(error.message);
                        $scope.loading = false;

                    });
                }else{
                    $scope.productData["_id"] = $routeParams.id;
                    $scope.loading = true;
                    $NxApi.products.update({
                        ...$scope.productData,
                        channels:$scope.productData.channels.map((item)=>item._id)
                    }).then(()=>{
                        $scope.$parent.toast('The product was update');
                        $scope.loading = false;

                    }).catch((error) => {
                        console.log(error);
                        $scope.$parent.toast(error.message);
                        $scope.loading = false;

                    });
                }

            }else{
                $scope.$parent.toast("The fields cannot be empty");
            }

        }

        function dialog_alert() {

            let title = 'Remove package';
            let description = 'You are sure to delete the selected package?';
            let templateUrl = "/res/layout/dialog_alert.html";
            let productId = $routeParams.id;

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
                                $mdDialog.cancel(error);
                                $scope.loading = false;
                            })

                    }

                    init();
                }

            });

        }

        function remove(){

            dialog_alert().then(()=>{
                $scope.$parent.toast('Package removed');
                $scope.loading = false;
                $mdDialog.hide();
                $location.path('/s/ott/products');
            }).catch((error) => {
                console.log(error);
                $scope.$parent.toast(error.message);
                $scope.loading = false;

            });
        }

        function _checkFields(){
            return $scope.productData.name !== '' && $scope.productData.description !== '' && $scope.productData.channels.length !== 0
        }

        $NxApi.setAfterLogin(init);

    }

})();