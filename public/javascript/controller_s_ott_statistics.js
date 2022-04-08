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
        .controller("sOttStatisticsCtrl", ['$scope', '$NxApi', '$mdToast', '$location', '$mdDialog', '$timeout',
            function ($scope, $NxApi, $mdToast, $location, $mdDialog, $timeout) {

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

                function AudienceCtrl() {

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
                        getData().then(drawChart);
                    };

                    $timeout(() => {
                        getData().then(drawChart);
                    }, 0);

                    function drawChart(data) {

                        let char_labels = data.date;
                        let chart_data_unique = data.uniqueUsers;
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
                                    display: false,
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
                                        stacked: false,
                                        ticks: {
                                            beginAtZero: true
                                        }
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
                                        stacked: false,
                                        ticks: {
                                            beginAtZero: true
                                        }
                                    }]
                                }
                            }
                        });


                    }

                    function getData() {
                        return new Promise((resolve, reject) => {

                            $scope.summary = {
                                uniqueUsers: 0,
                                avgPTPD: 0
                            };

                            let result = {
                                date: [],
                                uniqueUsers: [],
                                avgPTPD: []
                            };

                            $NxApi.statistics.dailyPlay({
                                from: $scope.filters.dates.start.getTime(),
                                until: $scope.filters.dates.end.getTime()
                            }).then((data) => {

                                let uidx = [];

                                for (let item of data) {

                                    let date = new Date(item.date);

                                    result.date.push(`${date.getDate()}/${date.getMonth() + 1}`);
                                    result.uniqueUsers.push(item.peaks.uniqueUsers);
                                    result.avgPTPD.push(Math.round(item.avgPerSub.playingTime / 60000));

                                    if (item.avgPerSub.playingTime !== 0) {
                                        $scope.summary.avgPTPD += item.avgPerSub.playingTime;
                                    } else {
                                        $scope.summary.avgPTPD = item.avgPerSub.playingTime;
                                    }

                                    for (let s in item.subscribers) {
                                        uidx[s] = 1;
                                    }

                                }

                                for (let id in uidx) {
                                    $scope.summary.uniqueUsers++;
                                }

                                $scope.summary.avgPTPD /= data.length;

                                resolve(result);
                            });

                        });
                    }

                }

                function ContentCtrl() {

                    $scope.templateUrl = "/res/layout/view_s_ott_statistics_content.html";

                    $scope.summary = {};

                    cleanUp = (_) => {
                        // Clean data on new section fill
                        $scope.summary = null;
                        $scope.filters.dates.onDateChanged = () => {
                        }
                    };

                    $scope.filters.dates.onDateChanged = () => {
                        getData().then(drawChart);
                    };

                    $timeout(() => {
                        getData().then(drawChart);
                    }, 0);

                    function getData() {
                        return new Promise((resolve, reject) => {

                            $scope.summary = {
                                ios: 0,
                                android: 0,
                                androidTv: 0,
                                browser: 0
                            };

                            $NxApi.statistics.report({
                                from: $scope.filters.dates.start.getTime(),
                                until: $scope.filters.dates.end.getTime()
                            }).then((data) => {

                                let channelsTotals = [];

                                let chartData = {
                                    date: [],
                                    channels: {}
                                };

                                for (let item of data) {
                                    for (let channel of item.channels) {
                                        if (!channelsTotals[channel.id]) {
                                            channelsTotals[channel.id] = 0;
                                        }
                                        channelsTotals[channel.id] += channel.playingTime;
                                    }
                                }

                                let sorted = [];

                                for (let id in channelsTotals) {
                                    sorted.push({
                                        id: id,
                                        playingTime: channelsTotals[id]
                                    })
                                }

                                sorted.sort((a, b) => {
                                    return b.playingTime - a.playingTime;
                                });

                                let topChannels = sorted.slice(0, 20);

                                chartData.channels = {};

                                for (let channel of topChannels) {
                                    chartData.channels[channel.id] = [];
                                }

                                for (let item of data) {
                                    let date = new Date(item.date);
                                    chartData.date.push(`${date.getDate()}/${date.getMonth() + 1}`);

                                    for (let channel of topChannels) {
                                        let match = item.channels.find(it => it.id === channel.id);

                                        let value = 0;

                                        if (match) {
                                            value = Math.round(match.playingTime / 3600000);
                                        }

                                        chartData.channels[channel.id].push(value);
                                    }

                                }

                                addChannelNames({chartData, channelsTotals})
                                    .then(resolve)
                                    .catch(reject)
                            });

                        });
                    }

                    function addChannelNames(results) {
                        results.channelsIndex = {};
                        return new Promise((resolve, reject) => {
                            $NxApi.channels.read({namesOnly: true}).then((channels) => {
                                for (let channel of channels) {
                                    results.channelsIndex[channel._id] = channel;
                                }

                                resolve(results)

                            }).catch(reject);
                        });
                    }

                    function drawChart(data) {

                        let dataSet = [];

                        let char_labels = data.chartData.date;

                        for (let id in data.chartData.channels) {

                            let color = randomColor();

                            dataSet.push({
                                "label": data.channelsIndex[id].name,
                                "data": data.chartData.channels[id],
                                "backgroundColor": color
                            });

                        }

                        let ctx = document.getElementById("sb-chart").getElementsByTagName("canvas")[0];
                        document.getElementById("sb-chart").removeChild(ctx);
                        document.getElementById("sb-chart").appendChild(document.createElement("canvas"));
                        ctx = document.getElementById("sb-chart").getElementsByTagName("canvas")[0];

                        ctx.height = 125;

                        const config = {
                            type: 'bar',
                            data: {
                                labels: char_labels,
                                datasets: dataSet
                            },
                            options: {
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: "right",
                                        display: true,
                                        labels: {
                                            fontColor: 'black'
                                        }
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
                                    x: {
                                        stacked: true,
                                    },
                                    y: {
                                        stacked: true
                                    },
                                    xAxes: [{
                                        categoryPercentage: 1.0,
                                        barPercentage: 1.0
                                    }]
                                }
                            }
                        };

                        let myBarChart = new Chart(ctx, config);
                        /*
                        let myBarChart = new Chart(ctx, {
                            type: "bar",
                            data: {
                                labels: char_labels,
                                datasets: dataSet
                            },
                            options: {
                                layout: {
                                    padding: {
                                        left: 0,
                                        right: 0,
                                        top: 0,
                                        bottom: 0
                                    }
                                },
                                responsive: true,

                                scales: {
                                    xAxes: [{
                                        stacked: true,
                                        display: true,
                                    }],
                                    yAxes: [{
                                        display: true,
                                        stacked: true
                                    }]
                                }
                            }
                        });
                         */
                    }


                }

                function DevicesCtrl() {

                    $scope.templateUrl = "/res/layout/view_s_ott_statistics_devices.html";

                    $scope.summary = {
                        ios: 0,
                        android: 0,
                        androidTv: 0,
                        browser: 0
                    };

                    cleanUp = (_) => {
                        // Clean data on new section fill
                        $scope.summary = null;
                        $scope.filters.dates.onDateChanged = () => {
                        }
                    };

                    $scope.filters.dates.onDateChanged = () => {
                        getData().then(drawChart);
                    };

                    $timeout(() => {
                        getData().then(drawChart);
                    }, 0);

                    function getData() {
                        return new Promise((resolve, reject) => {

                            $scope.summary = {
                                ios: 0,
                                android: 0,
                                androidTv: 0,
                                browser: 0
                            };

                            $NxApi.statistics.dailyPlay({
                                from: $scope.filters.dates.start.getTime(),
                                until: $scope.filters.dates.end.getTime()
                            }).then((data) => {

                                let result = {
                                    date: [],
                                    ios: [],
                                    android: [],
                                    androidTv: [],
                                    browser: []
                                };

                                for (let item of data) {

                                    $scope.summary.ios += item.devices.ios;
                                    $scope.summary.android += item.devices.android;
                                    $scope.summary.androidTv += item.devices.androidTv;
                                    $scope.summary.browser += item.devices.browser;


                                    let date = new Date(item.date);

                                    result.date.push(`${date.getDate()}/${date.getMonth() + 1}`);

                                    result.ios.push(item.devices.ios);
                                    result.android.push(item.devices.android);
                                    result.androidTv.push(item.devices.androidTv);
                                    result.browser.push(item.devices.browser);

                                }

                                let tnm = ($scope.summary.ios +
                                    $scope.summary.android +
                                    $scope.summary.androidTv +
                                    $scope.summary.browser) / 100;

                                $scope.summary.ios /= tnm;
                                $scope.summary.android /= tnm;
                                $scope.summary.androidTv /= tnm;
                                $scope.summary.browser /= tnm;

                                resolve(result);
                            });

                        });
                    }

                    function drawChart(data) {

                        let char_labels = data.date;

                        let chart_data_iOs = data.ios;
                        let chart_data_and = data.android;
                        let chart_data_box = data.androidTv;
                        let chart_data_browser = data.browser;

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
                                        "label": "Android",
                                        "data": chart_data_and,
                                        "fill": true,
                                        "backgroundColor": 'rgba(47,110,0,0.67)',
                                        "borderWidth": 0
                                    }, {
                                        "label": "TV Box",
                                        "data": chart_data_box,
                                        "fill": true,
                                        "backgroundColor": 'rgba(0,77,160,0.67)',
                                        "borderWidth": 0
                                    },
                                    {
                                        "label": "iOs",
                                        "data": chart_data_iOs,
                                        "fill": true,
                                        "backgroundColor": 'rgba(0,0,0,0.99)',
                                        "borderWidth": 0
                                    },
                                    {
                                        "label": "Browser",
                                        "data": chart_data_browser,
                                        "fill": true,
                                        "backgroundColor": 'rgba(203,83,35,0.67)',
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
                    if (!this.i) i = 0;
                    return colors[i++ % colors.length];
                }

                // End of code

                $NxApi.setAfterLogin(init);

            }]);
})();