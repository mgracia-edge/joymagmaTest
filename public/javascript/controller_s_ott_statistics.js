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

import ContentCtrl from "./stats/statsContentCtrl"
import AudienceCtrl from "./stats/statsAudienceCtrl"
import DevicesCtrl from "./stats/statsDevicesCtrl"

(function () {

    const parameterAvilable = {
        aggregation: "aggregation"
    };
    const parameterDefault = {
        aggregation: "auto"
    };

    let  nextColor = 0;

    angular.module('NxStudio')
        .controller("sOttStatisticsCtrl", ['$scope', '$NxApi', '$mdToast', '$location', '$mdDialog', '$timeout',
            function ($scope, $NxApi, $mdToast, $location, $mdDialog, $timeout) {

                $scope.sectionName = "Choose a section";
                $scope.filters = {
                    active: false,
                    changeDates: changeDates,
                    changeParameters: changeParameters,
                    dates: setDatesToLastWeek(),
                    parameters: {},
                    onDateChanged: () => {
                    },
                    onParameterChanged: () => {
                    }
                };

                $scope.sections = [
                    {
                        name: "Subscribers",
                        icon: "/res/drawable/ic_users.svg",
                        controller: SubscribersCtrl
                    }, {
                        name: "Audience",
                        icon: "/res/drawable/ic_viewing.svg",
                        controller: AudienceCtrl
                    }, {
                        name: "Content",
                        icon: "/res/drawable/ic_show.svg",
                        controller: ContentCtrl
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

                    let masterScope = $scope;

                    $mdDialog.show({
                        templateUrl: "/res/layout/fragment_dialog_filter.html",
                        controller: ($scope, $mdDialog) => {

                            $scope.cancel = function () {
                                $mdDialog.hide()
                            };

                            $scope.save = function () {
                                masterScope.filters.parameters = {}
                                if ($scope.ctrl.aggregation !== parameterDefault["aggregation"]) {
                                    masterScope.filters.parameters[parameterAvilable["aggregation"]] = $scope.ctrl.aggregation
                                }
                                if (typeof masterScope.filters.onParameterChanged === "function") {
                                    masterScope.filters.onParameterChanged();
                                }
                                $mdDialog.hide()
                                masterScope.filters.active = Object.entries(masterScope.filters.parameters).length !== 0 ? true : false
                            };

                            $scope.ctrl = {
                                aggregation: masterScope.filters.parameters[parameterAvilable["aggregation"]] || parameterDefault["aggregation"]
                            };

                        }
                    })
                }

                function startSection(section) {

                    if (typeof section.controller === "function") {
                        cleanUp();
                        $scope.currentSection = section;
                        section.controller($scope, $timeout, Chart, cleanUp,$NxApi, randomColor) ;
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
                        $scope.filters.onParameterChanged = () => {
                        }
                    };

                    $scope.filters.dates.onDateChanged = () => {
                        getData().then(drawChart);

                    };

                    $scope.filters.onParameterChanged = () => {
                        getData().then(drawChart);

                    };                    

                    $timeout(() => {
                        getData().then(drawChart);
                    }, 0);

                    function drawChart(data) {

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
                        return new Promise((resolve, reject) => {

                            $scope.summary = {
                                new: 0,
                                deletion: 0,
                                active: 0
                            };

                            $NxApi.statistics.subscribers({
                                from: $scope.filters.dates.start.getTime(),
                                until: $scope.filters.dates.end.getTime()
                            }).then((data) => {

                                let result = {
                                    date: [],
                                    active: [],
                                    new: [],
                                    deletions: []
                                };

                                for (let item of data) {

                                    let date = new Date(item.date);

                                    result.date.push(`${date.getDate()}/${date.getMonth() + 1}`);
                                    result.active.push(item.active.total);
                                    result.new.push(item.installs.total);
                                    result.deletions.push(item.uninstalls.total);

                                    $scope.summary.new += item.installs.total;
                                    $scope.summary.deletion += item.uninstalls.total;

                                }

                                $scope.summary.active = result.active[result.active.length - 1];

                                resolve(result);

                            })

                        });
                    }

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


                function randomColor() {
                    let colors =
                        [
                            "#068f23", "#8a2d65", "#ed8052",
                            "#4ea032", "#568ea8", "#d43d51",
                            "#77b143", "#e2604f", "#bed36c",
                            "#9cc256", "#864780", "#f49f5b",
                            "#dfe584", "#8f0b80", "#1b94ad",
                            "#b03317", "#1e6dff", "#205b1c",
                            "#ffab31", "#126eb4", "#d03cc0",
                        ];
                    if (!nextColor) nextColor = 0;
                    return colors[nextColor++ % colors.length];
                }

                // End of code

                $NxApi.setAfterLogin(init);

            }]);
})();