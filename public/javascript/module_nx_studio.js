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
    angular.module('NxStudio', ['ngMaterial', 'ngMessages', 'ngRoute'])
        .config(function ($routeProvider, $locationProvider, $mdThemingProvider){

            $routeProvider
                .when('/', {
                    templateUrl: '/res/layout/view_home.html',
                    controller: 'HomeCtrl'
                })
                .when('/login', {
                    templateUrl: '/res/layout/view_login.html',
                    controller: 'LoginCtrl'
                })
                .when('/s/ott/channel', {
                    templateUrl: '/res/layout/view_s_ott_channel.html',
                    controller: 'sOttChannelCtrl'
                });

            $locationProvider.html5Mode(true);

        })
        .run(["$rootScope", "$location", "$window","$NxNav", function run($rootScope,$location, $window,$NxNav) {
            /*// initialise google analytics
            $window.ga('create', 'UA-126373601-1', 'auto');

            $rootScope.$on('$routeChangeSuccess', function (event) {
                $window.ga('send', 'pageview', $location.path());
            });*/


            $rootScope.$on('$routeChangeSuccess', function (event) {
                if($location.path() == "/login"){
                    $NxNav.hide();
                }else{
                    $NxNav.show();
                }
            });



        }]);
})();