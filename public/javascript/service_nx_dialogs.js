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
    const C = {};

    angular.module('NxStudio')
        .factory('$NxDialogs', ['$http', '$q', '$mdDialog', '$location', '$NxApi',
            function ($http, $q, $mdDialog, $location, $NxApi) {

                return {
                    showAdd: showAddDelegation($http, $q, $mdDialog, $location, $NxApi),
                    showChannelSelector: showChannelSelectorDelegation($http, $q, $mdDialog, $location, $NxApi)
                }

            }]);


    function showAddDelegation($http, $q, $mdDialog, $location, $NxApi) {

        function show($event) {
            let addDialog = {
                templateUrl: "/res/layout/fragment_dialog_add.html",
                controller: controller,

            };


            function controller($scope, $mdDialog) {

                $scope.cancel = cancel;

                $scope.add = add;


                function cancel() {
                    $mdDialog.hide()
                }

                function add(event) {
                    cancel();
                    switch (event) {
                        case "channel": {
                            $location.path("/s/ott/channel/new");
                            break;
                        }
                        default: {
                            $location.path("/s/ott/products/new")
                        }
                    }

                }


            }

            $mdDialog.show(addDialog);
        }


        return show;

    }
    function showChannelSelectorDelegation($http, $q, $mdDialog, $location, $NxApi) {

        function show($event) {
            return $q((solve, reject) => {

                let addDialog = {
                    templateUrl: "/res/layout/fragment_dialog_channel_list.html",
                    controller: controller,
                };


                function controller($scope, $mdDialog) {

                    $scope.cancel = cancel;
                    $scope.select = select;
                    $scope.channels = [];

                    function init() {

                        $NxApi.channels.read({}).then((data)=>{
                            $scope.channels = data;
                        })

                    }

                    function cancel() {
                        $mdDialog.hide()
                    }

                    function select(channel) {
                        cancel();
                        solve(channel)
                    }

                    init();
                }

                $mdDialog.show(addDialog);

            });
        }


        return show;

    }


})();