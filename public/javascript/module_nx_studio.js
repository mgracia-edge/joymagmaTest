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
        .config(["$routeProvider", "$locationProvider", "$mdThemingProvider",function ($routeProvider, $locationProvider, $mdThemingProvider){

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
                })
                .when('/s/ott/subscribers', {
                    templateUrl: '/res/layout/view_s_ott_subscribers.html',
                    controller: 'sOttSubscribersCtrl'
                })
                .when('/s/ott/products', {
                    templateUrl: '/res/layout/view_s_ott_products.html',
                    controller: 'sOttProductsCtrl'
                })
                .when('/s/ott/epg_monitor', {
                    templateUrl: '/res/layout/view_s_ott_epg_monitor.html',
                    controller: 'sOttEPGMonitorCtrl'
                })
                .when('/s/ott/config', {
                    templateUrl: '/res/layout/view_s_ott_config.html',
                    controller: 'sOttConfigCtrl'
                })
                .when('/s/user-profile', {
                    templateUrl: '/res/layout/view_s_user_profile.html',
                    controller: 'sUserProfileCtrl'
                })
                .when('/s/account/settings', {
                    templateUrl: '/res/layout/view_s_account_settings.html',
                    controller: 'sAccountSettingsCtrl'
                })
                .when('/s/account/settings/users', {
                    templateUrl: '/res/layout/view_s_account_settings_users.html',
                    controller: 'sAccountSettingsUsersCtrl'
                })
                .when('/s/account/settings/users/:user_id', {
                    templateUrl: '/res/layout/view_s_account_settings_user.html',
                    controller: 'sAccountSettingsUserCtrl'
                })
                .when('/s/n/a', {
                    templateUrl: '/res/layout/view_n_a.html',
                    controller: 'sNACtrl'
                });

            $locationProvider.html5Mode(true);

        }])
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