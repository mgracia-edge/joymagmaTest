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
        .controller("sOttSubscribersDetailCtrl",
            ['$scope', '$NxApi', '$mdToast', '$location', '$routeParams','$timeout',
                function ($scope, $NxApi, $mdToast, $location, $routeParams,$timeout) {

                    $scope.menssage = '';
                    $scope.loading = false;
                    $scope.promise = null;

                    $scope.checkPassword = checkPassword;

                    function init() {

                        let subscriberId = $routeParams.id;

                        $NxApi.subscribers.read({
                            id: subscriberId,
                            includeUpdateHistory: true
                        }).then(({subscribers}) => {
                            $scope.subscriber = subscribers[0];


                            $NxApi.products.read({
                                _id:$scope.subscriber.products
                            }).then((products)=>{
                                $scope.subscriber.products = products;
                            })


                        }).catch((e) => {
                            console.error(e);
                        })

                    }

                    function checkPassword() {
                        $scope.menssage = '';
                        $scope.loading = true;
                        $NxApi.subscribers.checkSubscriberCredentials({
                            email: $scope.subscriber.email,
                            password: $scope.password
                        }).then((data) => {
                            $scope.menssage = data;
                            $scope.backgroundAlert = {
                                background: '#c9ffc9'
                            };
                            $timeout.cancel($scope.promise);
                            $scope.promise = $timeout(()=>$scope.menssage = '',3000);

                        }).catch((error) => {
                            $scope.menssage = error;
                            $timeout.cancel($scope.promise);
                            $scope.promise = $timeout(()=>$scope.menssage = '',3000);
                            $scope.backgroundAlert = {
                                background: 'tomato'
                            };
                        }).finally(()=>{
                            $scope.loading = false;
                        })
                    }

                    $NxApi.setAfterLogin(init);

                }]);
})();