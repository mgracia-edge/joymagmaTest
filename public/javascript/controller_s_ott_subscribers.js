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
        .controller("sOttSubscribersCtrl", ['$scope', '$NxApi', '$mdToast','$location',
            function ($scope, $NxApi, $mdToast,$location) {

            $scope.subscribers = [];
            $scope.loading = true;

            $scope.details = details;

            function init(){
                $NxApi.subscribers.read().then((data)=>{
                    $scope.subscribers = data.subscribers;

                    $scope.subscribers.map((subscriber)=>{

                        $NxApi.products.read({
                            _id:subscriber.products
                        }).then((products)=>{
                            subscriber.products = products;
                        })

                    });

                    setTimeout(()=> $scope.loading = false,1000);


                }).catch((e)=>{
                    console.error(e);
                })
            }

            function details(subscriber){
                $location.path('/s/ott/subscribers/' + subscriber._id)
            }

            $NxApi.setAfterLogin(init);


        }]);
})();