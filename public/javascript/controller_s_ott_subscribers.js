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
        .controller("sOttSubscribersCtrl", ['$scope', '$NxApi', '$mdToast', '$location', '$timeout',
            function ($scope, $NxApi, $mdToast, $location, $timeout) {

                $scope.subscribers = {
                    getItemAtIndex: function (i) {
                        return null;
                    },
                    getLength: function () {
                        return 0;
                    }
                };

                $scope.sortedBy = sortedBy;
                $scope.sortBy = sortBy;

                let sortVars = {
                    by: "id",
                    order: 1
                };

                let subscribers = [];
                let products = [];

                $scope.loading = true;
                $scope.details = details;

                $scope.productName = function (id) {
                    return products.find(element => element._id === id).name;
                };

                function init() {

                    $NxApi.products.read({}).then((result) => {
                        products = result;
                    });

                    $NxApi.subscribers.read().then((data) => {

                        subscribers = data.subscribers;


                        sortSubscribers();

                        $scope.subscribers = {
                            getItemAtIndex: function (i) {
                                return subscribers[i];
                            },
                            getLength: function () {
                                return subscribers.length;
                            }
                        };

                        $scope.$watch("search", (newValue) => {
                            if(!newValue || newValue === ""){
                                subscribers = data.subscribers;
                            }else{
                                subscribers = [];

                                for(let subscriber of data.subscribers){

                                    if( subscriber.cid.toString().includes(newValue) ||
                                        subscriber.email.toLowerCase().includes(newValue.toLowerCase())){
                                        subscribers.push(subscriber)
                                    }

                                }

                            }
                        });

                        $scope.loading = false;

                    }).catch((e) => {
                        console.error(e);
                    })
                }

                function details(subscriber) {
                    $location.path('/s/ott/subscribers/' + subscriber._id)
                }

                function sortedBy(field, order) {
                    return order === sortVars.order && field === sortVars.by;
                }

                function sortBy(field){

                    if(sortVars.by === field){
                        sortVars.order = (sortVars.order + 1) % 2; // Toggle
                    }else{
                        sortVars.by = field;
                        sortVars.order = 0;
                    }

                    sortSubscribers();

                }

                function sortSubscribers(){
                    let field = sortVars.by;
                    switch (field) {
                        case "id":{
                            subscribers.sort((a,b)=>{
                                if(sortVars.order === 0){
                                    return a._id > b._id?1:-1
                                }else{
                                    return a._id < b._id?1:-1
                                }
                            });
                            break;
                        }
                        case "packages":{
                            break;
                        }
                        case "email":{
                            subscribers.sort((a,b)=>{
                                if(sortVars.order === 0){
                                    return a.email > b.email?1:-1
                                }else{
                                    return a.email < b.email?1:-1
                                }
                            });
                            break;
                        }
                        case "creationd":{
                            subscribers.sort((a,b)=>{
                                if(sortVars.order === 0){
                                    return a.creationDate > b.creationDate?1:-1
                                }else{
                                    return a.creationDate < b.creationDate?1:-1
                                }
                            });
                            break;
                        }
                        case "lastud":{
                            subscribers.sort((a,b)=>{
                                if(sortVars.order === 0){
                                    return a.lastUpdate > b.lastUpdate?1:-1
                                }else{
                                    return a.lastUpdate < b.lastUpdate?1:-1
                                }
                            });
                            break;
                        }
                        case "detail":{
                        }
                    }
                }

                $NxApi.setAfterLogin(init);

            }]);
})();