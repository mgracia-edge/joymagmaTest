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
        .controller("sOttStatisticsCtrl", ['$scope', '$NxApi', '$mdToast', '$location', '$mdDialog', '$timeout', function ($scope, $NxApi, $mdToast, $location, $mdDialog, $timeout) {

            $scope.sectionName = "Choose a section";
            $scope.filters = {
                active: false,
                changeDates: changeDates,
                changeParameters: changeParameters,
                dates: setDatesToLastWeek(),
                parameters: [],
                onDateChanged: () => {
                }
            };

            $scope.sections = [
                {
                    name: "Subscribers",
                    icon: "/res/drawable/ic_users.svg",
                    controller: SubscribersCtrl
                }, {
                    name: "Viewing",
                    icon: "/res/drawable/ic_viewing.svg",
                    controller: ViewingCtrl
                }, {
                    name: "Devices",
                    icon: "/res/drawable/ic_devices.svg",
                    controller: DevicesCtrl
                }
            ];

            $scope.startSection = startSection;

            let cleanUp = (_) => {
            };

            function init() {
                startSection($scope.sections[0]);
            }

            function changeDates() {

                let masterScope = $scope;

                $mdDialog.show({
                    templateUrl: "/res/layout/fragment_dialog_date_rage.html",
                    controller: ($scope, $mdDialog) => {

                        $scope.cancel = function () {
                            $mdDialog.hide()
                        };

                        $scope.save = function () {

                            masterScope.filters.dates.start = $scope.ctrl.startDate;
                            masterScope.filters.dates.end = $scope.ctrl.endDate;

                            if (typeof masterScope.filters.dates.onDateChanged === "function") {
                                masterScope.filters.dates.onDateChanged();
                            }
                            $mdDialog.hide()
                        };

                        $scope.ctrl = {
                            startDate: new Date(masterScope.filters.dates.start),
                            endDate: new Date(masterScope.filters.dates.end)
                        };

                    }
                })
            }

            function changeParameters() {
                $scope.filters.active = true;
            }

            function startSection(section) {

                if (typeof section.controller === "function") {
                    cleanUp();
                    $scope.currentSection = section;
                    section.controller();
                }

            }

            function SubscribersCtrl() {

                $scope.templateUrl = "/res/layout/view_s_ott_statistics_subscribers.html";

                $scope.summary = {
                    new: 0,
                    deletion: 0,
                    active: 0
                };

                cleanUp = (_) => {
                    // Clean data on new section fill
                    $scope.summary = null;
                    $scope.filters.dates.onDateChanged = () => {
                    }
                };

                $scope.filters.dates.onDateChanged = () => {
                    drawChart();
                };

                $timeout(() => {

                    drawChart();

                }, 1000);

                function drawChart() {

                    let data = getData();

                    let char_labels = data.date;
                    let chart_data_active = data.active;
                    let chart_data_new = data.new;
                    let chart_data_del = data.deletions;

                    let ctx = document.getElementById("sb-chart").getElementsByTagName("canvas")[0];
                    document.getElementById("sb-chart").removeChild(ctx);
                    document.getElementById("sb-chart").appendChild(document.createElement("canvas"));
                    ctx = document.getElementById("sb-chart").getElementsByTagName("canvas")[0];

                    ctx.height = 125;
                    let myBarChart = new Chart(ctx, {
                        "type": "line",
                        "data": {
                            "labels": char_labels,
                            "datasets": [
                                {
                                    "label": "Unsubscription",
                                    "data": chart_data_del,
                                    "fill": true,
                                    "backgroundColor": 'rgba(154,1,16,0.67)',
                                    "borderWidth": 0
                                }, {
                                    "label": "New Subscribers",
                                    "data": chart_data_new,
                                    "fill": true,
                                    "backgroundColor": 'rgba(57,133,0,0.67)',
                                    "borderWidth": 0
                                },
                                {
                                    "label": "Active Subscribers",
                                    "data": chart_data_active,
                                    "fill": true,
                                    "backgroundColor": 'rgba(0,77,160,0.67)',
                                    "borderWidth": 0
                                }]
                        },
                        "options": {
                            layout: {
                                padding: {
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    bottom: 0
                                }
                            },
                            legend: {
                                position: "bottom",
                                display: true,
                                labels: {
                                    fontColor: 'black'
                                }
                            },
                            title: {
                                display: false
                            },
                            tooltips: {
                                enabled: true,
                                display: false,
                            },
                            scales: {
                                xAxes: [{
                                    stacked: false,
                                    display: true,
                                }],
                                yAxes: [{
                                    display: true,
                                    stacked: false
                                }]
                            }
                        }
                    });
                }

                function getData() {

                    $scope.summary = {
                        new: 0,
                        deletion: 0,
                        active: 0
                    };

                    let data = [
                        {
                            date: new Date("2019-08-01"),
                            active: 41,
                            new: 0,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-02"),
                            active: 41,
                            new: 0,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-03"),
                            active: 41,
                            new: 0,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-04"),
                            active: 41,
                            new: 0,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-05"),
                            active: 41,
                            new: 0,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-06"),
                            active: 41,
                            new: 0,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-07"),
                            active: 41,
                            new: 0,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-08"),
                            active: 42,
                            new: 1,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-09"),
                            active: 43,
                            new: 1,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-10"),
                            active: 43,
                            new: 0,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-11"),
                            active: 43,
                            new: 0,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-12"),
                            active: 44,
                            new: 1,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-13"),
                            active: 46,
                            new: 2,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-14"),
                            active: 46,
                            new: 0,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-15"),
                            active: 46,
                            new: 0,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-16"),
                            active: 55,
                            new: 9,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-17"),
                            active: 55,
                            new: 0,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-18"),
                            active: 55,
                            new: 0,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-19"),
                            active: 62,
                            new: 7,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-20"),
                            active: 65,
                            new: 3,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-21"),
                            active: 68,
                            new: 3,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-21"),
                            active: 93,
                            new: 25,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-23"),
                            active: 105,
                            new: 12,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-24"),
                            active: 105,
                            new: 0,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-25"),
                            active: 105,
                            new: 0,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-26"),
                            active: 122,
                            new: 17,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-27"),
                            active: 144,
                            new: 20,
                            deletion: 0
                        },
                        {
                            date: new Date("2019-08-28"),
                            active: 155,
                            new: 11,
                            deletion: 0
                        }
                    ];

                    let result = {
                        date: [],
                        active: [],
                        new: [],
                        deletions: []
                    };

                    for (let item of data) {
                        if (item.date.getTime() >= $scope.filters.dates.start.getTime() &&
                            item.date.getTime() <= $scope.filters.dates.end.getTime()) {

                            result.date.push(`${item.date.getDate()}/${item.date.getMonth() + 1}`);
                            result.active.push(item.active);
                            result.new.push(item.new);
                            result.deletions.push(item.deletion);

                            $scope.summary.new += item.new;
                            $scope.summary.deletion += item.deletion;
                        }
                    }

                    $scope.summary.active = result.active[result.active.length - 1];

                    return result;

                }

            }

            function ViewingCtrl() {

                $scope.templateUrl = "/res/layout/view_s_ott_statistics_viewing.html";

                $scope.summary = {
                    concurrency: 0,
                    uniqueUsers: 0,
                    avgPTPD: 0
                };

                cleanUp = (_) => {
                    // Clean data on new section fill
                    $scope.summary = null;
                    $scope.filters.dates.onDateChanged = () => {
                    }
                };

                $scope.filters.dates.onDateChanged = () => {
                    drawChart();
                };

                $timeout(() => {

                    drawChart();

                }, 1000);

                function drawChart() {

                    let data = getData();

                    let char_labels = data.date;
                    let chart_data_unique = data.uniqueUsers;
                    let chart_data_concurrency = data.concurrency;
                    let chart_data_avgPTPD = data.avgPTPD;

                    let ctx = document.getElementById("sb-chart-1").getElementsByTagName("canvas")[0];
                    document.getElementById("sb-chart-1").removeChild(ctx);
                    document.getElementById("sb-chart-1").appendChild(document.createElement("canvas"));
                    ctx = document.getElementById("sb-chart-1").getElementsByTagName("canvas")[0];

                    ctx.height = 125;
                    let myBarChart = new Chart(ctx, {
                        "type": "line",
                        "data": {
                            "labels": char_labels,
                            "datasets": [
                                {
                                    "label": "Concurrent Users",
                                    "data": chart_data_concurrency,
                                    "fill": true,
                                    "backgroundColor": 'rgba(154,1,16,0.67)',
                                    "borderWidth": 0
                                }, {
                                    "label": "Unique Users",
                                    "data": chart_data_unique,
                                    "fill": true,
                                    "backgroundColor": 'rgba(57,133,0,0.67)',
                                    "borderWidth": 0
                                }]
                        },
                        "options": {
                            layout: {
                                padding: {
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    bottom: 0
                                }
                            },
                            legend: {
                                position: "bottom",
                                display: true,
                                labels: {
                                    fontColor: 'black'
                                }
                            },
                            title: {
                                display: false
                            },
                            tooltips: {
                                enabled: true,
                                display: false,
                            },
                            scales: {
                                xAxes: [{
                                    stacked: false,
                                    display: true,
                                }],
                                yAxes: [{
                                    display: true,
                                    stacked: false
                                }]
                            }
                        }
                    });



                    let ctx2 = document.getElementById("sb-chart-2").getElementsByTagName("canvas")[0];
                    document.getElementById("sb-chart-2").removeChild(ctx2);
                    document.getElementById("sb-chart-2").appendChild(document.createElement("canvas"));
                    ctx2 = document.getElementById("sb-chart-2").getElementsByTagName("canvas")[0];

                    ctx2.height = 125;
                    let myBarChar2t = new Chart(ctx2, {
                        "type": "line",
                        "data": {
                            "labels": char_labels,
                            "datasets": [
                                {
                                    "label": "Average Playing Time per Subscriber",
                                    "data": chart_data_avgPTPD,
                                    "fill": true,
                                    "backgroundColor": 'rgba(154,1,16,0.67)',
                                    "borderWidth": 0
                                }]
                        },
                        "options": {
                            layout: {
                                padding: {
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    bottom: 0
                                }
                            },
                            legend: {
                                position: "bottom",
                                display: true,
                                labels: {
                                    fontColor: 'black'
                                }
                            },
                            title: {
                                display: false
                            },
                            tooltips: {
                                enabled: true,
                                display: false,
                            },
                            scales: {
                                xAxes: [{
                                    stacked: false,
                                    display: true,
                                }],
                                yAxes: [{
                                    display: true,
                                    stacked: false
                                }]
                            }
                        }
                    });


                }

                function getData() {

                    $scope.summary = {
                        concurrency: 0,
                        uniqueUsers: 0,
                        avgPTPD: 0
                    };

                    let data = [
                        {
                            date: new Date("2019-08-01"),
                            concurrency: 21,
                            uniqueUsers: 26,
                            avgPTPD: 78
                        },
                        {
                            date: new Date("2019-08-02"),
                            concurrency: 25,
                            uniqueUsers: 29,
                            avgPTPD: 65
                        },
                        {
                            date: new Date("2019-08-03"),
                            concurrency: 12,
                            uniqueUsers: 22,
                            avgPTPD: 88
                        },
                        {
                            date: new Date("2019-08-04"),
                            concurrency: 27,
                            uniqueUsers: 30,
                            avgPTPD: 78
                        },
                        {
                            date: new Date("2019-08-05"),
                            concurrency: 23,
                            uniqueUsers: 31,
                            avgPTPD: 74
                        },
                        {
                            date: new Date("2019-08-06"),
                            concurrency: 22,
                            uniqueUsers: 33,
                            avgPTPD: 75
                        },
                        {
                            date: new Date("2019-08-07"),
                            concurrency: 18,
                            uniqueUsers: 30,
                            avgPTPD: 79
                        },
                        {
                            date: new Date("2019-08-08"),
                            concurrency: 25,
                            uniqueUsers: 39,
                            avgPTPD: 73
                        },
                        {
                            date: new Date("2019-08-09"),
                            concurrency: 21,
                            uniqueUsers: 36,
                            avgPTPD: 75
                        },
                        {
                            date: new Date("2019-08-10"),
                            concurrency: 20,
                            uniqueUsers: 31,
                            avgPTPD: 75
                        },
                        {
                            date: new Date("2019-08-11"),
                            concurrency: 35,
                            uniqueUsers: 45,
                            avgPTPD: 197
                        },
                        {
                            date: new Date("2019-08-12"),
                            concurrency: 21,
                            uniqueUsers: 38,
                            avgPTPD: 73
                        },
                        {
                            date: new Date("2019-08-13"),
                            concurrency: 21,
                            uniqueUsers: 36,
                            avgPTPD: 74
                        },
                        {
                            date: new Date("2019-08-14"),
                            concurrency: 21,
                            uniqueUsers: 37,
                            avgPTPD: 70
                        },
                        {
                            date: new Date("2019-08-15"),
                            concurrency: 21,
                            uniqueUsers: 34,
                            avgPTPD: 72
                        },
                        {
                            date: new Date("2019-08-16"),
                            concurrency: 35,
                            uniqueUsers: 47,
                            avgPTPD: 79
                        },
                        {
                            date: new Date("2019-08-17"),
                            concurrency: 37,
                            uniqueUsers: 44,
                            avgPTPD: 70
                        },
                        {
                            date: new Date("2019-08-18"),
                            concurrency: 43,
                            uniqueUsers: 62,
                            avgPTPD: 73
                        },
                        {
                            date: new Date("2019-08-19"),
                            concurrency: 40,
                            uniqueUsers: 61,
                            avgPTPD: 76
                        },
                        {
                            date: new Date("2019-08-20"),
                            concurrency: 33,
                            uniqueUsers: 63,
                            avgPTPD: 70
                        },
                        {
                            date: new Date("2019-08-21"),
                            concurrency: 54,
                            uniqueUsers: 67,
                            avgPTPD: 75
                        },
                        {
                            date: new Date("2019-08-21"),
                            concurrency: 63,
                            uniqueUsers: 78,
                            avgPTPD: 72
                        },
                        {
                            date: new Date("2019-08-23"),
                            concurrency: 68,
                            uniqueUsers: 89,
                            avgPTPD: 73
                        },
                        {
                            date: new Date("2019-08-24"),
                            concurrency: 62,
                            uniqueUsers: 94,
                            avgPTPD: 74
                        },
                        {
                            date: new Date("2019-08-25"),
                            concurrency: 73,
                            uniqueUsers: 99,
                            avgPTPD: 79
                        },
                        {
                            date: new Date("2019-08-26"),
                            concurrency: 81,
                            uniqueUsers: 101,
                            avgPTPD: 79
                        },
                        {
                            date: new Date("2019-08-27"),
                            concurrency: 102,
                            uniqueUsers: 125,
                            avgPTPD: 76
                        },
                        {
                            date: new Date("2019-08-28"),
                            concurrency: 67,
                            uniqueUsers: 99,
                            avgPTPD: 76
                        }
                    ];

                    let result = {
                        date: [],
                        concurrency: [],
                        uniqueUsers: [],
                        avgPTPD: []
                    };

                    for (let item of data) {
                        if (item.date.getTime() >= $scope.filters.dates.start.getTime() &&
                            item.date.getTime() <= $scope.filters.dates.end.getTime()) {

                            result.date.push(`${item.date.getDate()}/${item.date.getMonth() + 1}`);
                            result.concurrency.push(item.concurrency);
                            result.uniqueUsers.push(item.uniqueUsers);
                            result.avgPTPD.push(item.avgPTPD);

                            if ($scope.summary.concurrency < item.concurrency) {
                                $scope.summary.concurrency = item.concurrency;
                            }

                            if ($scope.summary.uniqueUsers < item.uniqueUsers) {
                                $scope.summary.uniqueUsers = item.uniqueUsers + 2;
                            }

                            if ($scope.summary.avgPTPD !== 0) {
                                $scope.summary.avgPTPD = ($scope.summary.avgPTPD + item.avgPTPD) / 2;
                            } else {
                                $scope.summary.avgPTPD = item.avgPTPD;
                            }

                        }
                    }

                    return result;

                }

            }

            function DevicesCtrl() {
                cleanUp = (_) => {
                    // Setup a new Clean Up Function in case other section is choose.
                };

                $scope.templateUrl = null;


            }

            function setDatesToLastWeek() {
                const DELTA = 604800000;
                let result = {};

                result.start = new Date();
                result.start.setTime(result.start.getTime() - DELTA);
                result.start.setHours(0, 0, 0, 0);

                result.end = new Date();
                result.end.setHours(0, 0, 0, 0);

                return result;
            }

            // End of code

            $NxApi.setAfterLogin(init);

        }]);
})();