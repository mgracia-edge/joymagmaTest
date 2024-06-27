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

// import AudienceCtrl from "./stats/statsAudienceCtrl"
// import DevicesCtrl from "./stats/statsDevicesCtrl"
// import GridAudienceCtrl from "./stats/statsGridAudienceCtrl"

function ContentCtrl($scope, $timeout, Chart, cleanUp, $NxApi, randomColor) {

    $scope.templateUrl = "/res/layout/view_s_ott_statistics_content.html";

    $scope.summary = {};

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
                until: $scope.filters.dates.end.getTime(),
                ...$scope.filters.parameters
            }).then((data) => {

                let channelsTotals = [];

                let chartData = {
                    date: [],
                    channels: {}
                };

                // Acum total playTime per channel in array by id
                for (let item of data) {
                    for (let channel of item.perChannel) {
                        if (!channelsTotals[channel.channelId]) {
                            channelsTotals[channel.channelId] = 0;
                        }
                        channelsTotals[channel.channelId] += channel.playTime;
                    }
                }

                let sorted = [];

                // Conver in array of object (Acum total)
                for (let id in channelsTotals) {
                    sorted.push({
                        id: id,
                        playTime: channelsTotals[id]
                    })
                }

                sorted.sort((a, b) => {
                    return b.playTime - a.playTime;
                });

                // Array of channels selected in filter or automatics top
                let selectedChannels = selectChannels(sorted);

                chartData.channels = {};

                for (let channel of selectedChannels) {
                    chartData.channels[channel.id] = [];
                }

                for (let item of data) {
                    chartData.date.push(item.date);

                    for (let channel of selectedChannels) {
                        let match = item.perChannel.find(it => it.channelId === channel.id);

                        let value = 0;

                        if (match) {
                            value = Math.round(match.concurrency);
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

    function selectChannels(totSortedChannels) {
        let selectedChannels = [];
        if ($scope.filters.channels.some(filterChannel => filterChannel.selected === true)) {
            selectedChannels = totSortedChannels.filter(totSortedChannel => 
                $scope.filters.channels.find(filterChannel => 
                    filterChannel._id === totSortedChannel.id && filterChannel.selected === true
                )
            )
        } else {
            selectedChannels = totSortedChannels.slice(0, 20);
        }
        return selectedChannels;
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
                label: data.channelsIndex[id].name,
                data: data.chartData.channels[id],
                backgroundColor: color,
                pointRadius: 0,
                borderWidth: 1,
                fill: true
            });

        }

        let ctx = document.getElementById("sb-chart").getElementsByTagName("canvas")[0];
        document.getElementById("sb-chart").removeChild(ctx);
        document.getElementById("sb-chart").appendChild(document.createElement("canvas"));
        ctx = document.getElementById("sb-chart").getElementsByTagName("canvas")[0];

        ctx.height = 125;

        const config = {
            type: 'line',
            data: {
                labels: char_labels,
                datasets: dataSet
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
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
                tooltip: {
                    mode: 'index'
                },
                scales: {
                    x: {
                        stacked: true,
                        type: 'time'
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

function AudienceCtrl($scope, $timeout, Chart, cleanUp, $NxApi) {

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
                        "borderWidth": 0,
                        "pointRadius": 0
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
                  x: {
                      stacked: false,
                      display: true,
                      type: 'time'
                  },
                  y: {
                      display: true,
                      stacked: false,
                      ticks: {
                          beginAtZero: true
                      }
                  },
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
                        "borderWidth": 0,
                        "pointRadius": 0
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
                  x: {
                      stacked: false,
                      display: true,
                      type: 'time'
                  },
                  y: {
                      display: true,
                      stacked: false,
                      ticks: {
                          beginAtZero: true
                      }
                  },
                }              
            }
        });
  
  
    }
  
    function getData() {
        return new Promise((resolve, reject) => {
  
            $scope.summary = {
                concurrency: 0,
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
                until: $scope.filters.dates.end.getTime(),
                ...$scope.filters.parameters,
            }).then((data) => {
                // let uidx = [];
                const uidx = new Set();
                
                for (let item of data) {
                    
                    let date = new Date(item.date);
                    let avgPlayTime = 0;
  
                    //result.date.push(`${date.getDate()}/${date.getMonth() + 1}`);
                    result.date.push(date);
                    //result.uniqueUsers.push(item.peaks.uniqueUsers);
                    result.uniqueUsers.push(item.numberOfSubscribers);
                    //result.avgPTPD.push(Math.round(item.avgPerSub.playingTime / 60000));
                    avgPlayTime = item.playTime / item.numberOfSubscribers;
                    result.avgPTPD.push(Math.round(avgPlayTime / 60000));
  
                    // if (item.avgPerSub.playingTime !== 0) {
                    //     $scope.summary.avgPTPD += item.avgPerSub.playingTime;
                    // } else {
                    //     $scope.summary.avgPTPD = item.avgPerSub.playingTime;
                    // }
  
                    // Conver to minutes in html layout
                    $scope.summary.avgPTPD += avgPlayTime;
                    // for (let s in item.subscribers) {
                    //     uidx[s] = 1;
                    // }
  
                    for (let s in item.sessions) {
                        uidx.add(s);
                    }                  
  
                }
  
                // for (let id in uidx) {
                //    $scope.summary.uniqueUsers++;
                // }
                
                $scope.summary.uniqueUsers = uidx.size;
                $scope.summary.avgPTPD /= data.length;
                
                resolve(result);
            });
  
        });
    }
  
  }

  function DevicesCtrl($scope, $timeout, Chart, cleanUp, $NxApi) {

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

    function getData() {
        return new Promise((resolve, reject) => {

            $scope.summary = {
                ios: 0,
                android: 0,
                androidTv: 0,
                browser: 0
            };

            $NxApi.statistics.devices({
                from: $scope.filters.dates.start.getTime(),
                until: $scope.filters.dates.end.getTime(),
                ...$scope.filters.parameters,
            }).then((data) => {

                const DB_DEVICE_KEY = {
                    "ANDROID": "android",
                    "ANDROID_TV": "android_tv",
                    "IOS": "ios",
                    "BROWSER": "browser"
                }

                let result = {
                    date: [],
                    ios: [],
                    android: [],
                    androidTv: [],
                    browser: []
                };

                let acumDevices = {};

                for (let item of data) {

                    let date = new Date(item.date);

                    if (!acumDevices[date]) {
                      acumDevices[date] = {};
                    }

                    acumDevices[date][item.device] = item.numberOfSubscribers;

                }

                // TODO: Podria no recorrer en orden las key
                // (como este caso la key son fechas parece no ser un problema)
                // Anlizar posibilidad de utilizar Map
                for (const dateKey in acumDevices) {

                    const date = new Date(dateKey);
                    const androidKey = acumDevices[dateKey][DB_DEVICE_KEY.ANDROID];
                    const androidTvKey = acumDevices[dateKey][DB_DEVICE_KEY.ANDROID_TV];
                    const iosKey = acumDevices[dateKey][DB_DEVICE_KEY.IOS];
                    const browserKey = acumDevices[dateKey][DB_DEVICE_KEY.BROWSER];

                    // console.log(`date: ${date} | android: ${androidKey} | android_tv: ${androidTvKey} |
                    // ios: ${iosKey} | browser: ${browserKey}`);

                    if (!androidTvKey) {
                        continue;
                    }
                    
                    result.date.push(date);
                    
                    result.android.push(androidKey ?? 0);
                    $scope.summary.android += androidKey ?? 0;
                
                    result.androidTv.push(androidTvKey);
                    $scope.summary.androidTv += androidTvKey;

                    result.ios.push(iosKey ?? 0);
                    $scope.summary.ios += iosKey ?? 0;

                    result.browser.push(browserKey ?? 0);
                    $scope.summary.browser += browserKey ?? 0;

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
                        "borderWidth": 0,
                        "pointRadius": 0
                    }, {
                        "label": "TV Box",
                        "data": chart_data_box,
                        "fill": true,
                        "backgroundColor": 'rgba(0,77,160,0.67)',
                        "borderWidth": 0,
                        "pointRadius": 0
                    },
                    {
                        "label": "iOs",
                        "data": chart_data_iOs,
                        "fill": true,
                        "backgroundColor": 'rgba(0,0,0,0.99)',
                        "borderWidth": 0,
                        "pointRadius": 0
                    },
                    {
                        "label": "Browser",
                        "data": chart_data_browser,
                        "fill": true,
                        "backgroundColor": 'rgba(203,83,35,0.67)',
                        "borderWidth": 0,
                        "pointRadius": 0
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
                    x: {
                        stacked: false,
                        display: true,
                        type: 'time'
                    },
                    y: {
                        stacked: false,
                        display: true
                    },

                }
            }
        });
    }

}

function GridAudienceCtrl($scope, $timeout, Chart, cleanUp, $NxApi, randomColor) {

    $scope.templateUrl = "/res/layout/view_s_ott_statistics_grid_audience.html";
  
    $scope.loading = true;
    $scope.dataSet = [];
    $scope.download = download;
  
    cleanUp = (_) => {
        // Clean data on new section fill
        $scope.filters.dates.onDateChanged = () => {
        }
        $scope.filters.onParameterChanged = () => {
        }        
    };
  
    $scope.filters.dates.onDateChanged = () => {
        getData().then(listData);
    };
  
    $scope.filters.onParameterChanged = () => {
        getData().then(listData);
    };    
  
    $timeout(() => {
        getData().then(listData);
    }, 0);
  
      function download() {
  
          let text = "Channel, Play Time (Hr)";
  
          for(let item of $scope.dataSet){
              text += `\n${item.name},${item.playTimeHs}`
          }
  
          let element = document.createElement('a');
          element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
          element.setAttribute('download', "grid_audience.csv");
  
          element.style.display = 'none';
          document.body.appendChild(element);
  
          element.click();
  
          document.body.removeChild(element);
  
      }
  
      function getData() {
        return new Promise((resolve, reject) => {
  
            $NxApi.statistics.report({
                from: $scope.filters.dates.start.getTime(),
                until: $scope.filters.dates.end.getTime(),
                // TODO: Check worker for "per_day"
                aggregation: "per_hr"
            }).then((data) => {
  
                let channelsTotals = [];
  
                // Acum total playTime per channel in array by id
                for (let item of data) {
                    for (let channel of item.perChannel) {
                        if (!channelsTotals[channel.channelId]) {
                            channelsTotals[channel.channelId] = 0;
                        }
                        channelsTotals[channel.channelId] += channel.playTime;
                    }
                }
  
                let sorted = [];
  
                // Conver in array of object (Acum total)
                for (let id in channelsTotals) {
                    sorted.push({
                        _id: id,
                        name: id,
                        playTime: channelsTotals[id],
                        // Convert ms to hr
                        //playTimeHs: Math.round(channelsTotals[id] / 3600000 * 100) / 100,
                        // Convert sg to hr || divided by 2 for duplicated data in collection
                        playTimeHs: Math.round((channelsTotals[id] / 2) / 3600 * 100) / 100,                      
                    })
                }
  
                sorted.sort((a, b) => {
                    return b.playTime - a.playTime;
                });
  
                addChannelNames(sorted)
                    .then(resolve)
                    .catch(reject)
  
  
            });
  
        });
    }
  
    function addChannelNames(results) {
        return new Promise((resolve, reject) => {
            $NxApi.channels.read({namesOnly: true}).then((channels) => {
                results.forEach((result) => {
                  result.name = channels.find(channel => channel._id === result._id)?.name || result._id
                })
                resolve(results)
            }).catch(reject);
        });
    }
  
    function listData(data) {
      $scope.dataSet = data;
      $scope.loading = false;
      $scope.$apply();
    }
  
  }
  
(function () {

    const parameterAvilable = {
        aggregation: "aggregation"
    };
    const parameterDefault = {
        aggregation: "auto"
    };
    const CONTENT = "Content";
    const GRID_AUDIENCE = "Grid Audience";

    let  nextColor = 0;

    angular.module('NxStudio')
        .controller("sOttStatisticsCtrl", ['$scope', '$NxApi', '$mdToast', '$location', '$mdDialog', '$timeout',
            function ($scope, $NxApi, $mdToast, $location, $mdDialog, $timeout) {

                $scope.sectionName = "Choose a section";
                $scope.filters = {
                    active: false,
                    changeDates: changeDates,
                    changeParameters: changeParameters,
                    //dates: setDatesToLastWeek(),
                    dates: setFilterDates("week"),
                    parameters: {},
                    channels: [],
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
                        name: CONTENT,
                        icon: "/res/drawable/ic_show.svg",
                        controller: ContentCtrl
                    }, {
                        name: "Devices",
                        icon: "/res/drawable/ic_devices.svg",
                        controller: DevicesCtrl
                    }, {
                        name: GRID_AUDIENCE,
                        icon: "/res/drawable/ic_epg_monitor.svg",
                        controller: GridAudienceCtrl
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
                                masterScope.filters.channels = $scope.ctrl.channels.map(it => ({...it}));
                                if (typeof masterScope.filters.onParameterChanged === "function") {
                                    masterScope.filters.onParameterChanged();
                                }
                                $mdDialog.hide()
                                masterScope.filters.active = Object.entries(masterScope.filters.parameters).length !== 0 ? true : false
                            };

                            $scope.selectChannel = function (channel) {
                                let canAdd = $scope.ctrl.totChannelSelected < 15;
                                const selectHandle = () => {
                                    $scope.ctrl.channels[$scope.ctrl.channels.findIndex(elm => elm._id === channel._id)].selected = !channel.selected;
                                }
                                if (channel.selected) {
                                    $scope.ctrl.totChannelSelected -= 1;
                                    selectHandle();
                                } else {
                                    if (canAdd) {
                                        $scope.ctrl.totChannelSelected += 1;
                                    selectHandle();
                                    }
                                }
                            };

                            $scope.ctrl = {
                                aggregation: masterScope.filters.parameters[parameterAvilable["aggregation"]] || parameterDefault["aggregation"],
                                channels: [],
                                showChannelList: masterScope.currentSection.name === CONTENT ? true : false,
                                showAggregation: masterScope.currentSection.name !== GRID_AUDIENCE ? true : false,
                                totChannelSelected: 0,
                            };

                            for (const channel of masterScope.filters.channels) {
                                $scope.ctrl.channels.push({...channel});
                                if (channel.selected) {
                                    $scope.ctrl.totChannelSelected += 1;
                                }
                            }
                        }
                    })
                }

                function startSection(section) {

                    if (typeof section.controller === "function") {
                        cleanUp();
                        $scope.currentSection = section;
                        if (section.name === CONTENT) {
                            $NxApi.channels.read({namesOnly: true}).then((data)=>{
                                console.log(data)
                                $scope.filters.channels = data.map(channel => ({...channel, selected: false}));
                                // TODO: Other channel acum
                                //$scope.filters.channels.unshift({_id: 1234567890, name: "Others", poster: [{url:""}], selected: false});
                            });
                        } else if (section.name === GRID_AUDIENCE) {
                            $scope.filters.dates = setFilterDates("month");
                        }
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
                                    x: {
                                        stacked: false,
                                        display: true,
                                    },
                                    y: {
                                        stacked: false,
                                        display: true
                                    },
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

                                    let date = new Date(item.fromDate);

                                    // result.date.push(`${date.getDate()}/${date.getMonth() + 1}`);
                                    result.date.push(`${date.getUTCDate()}/${date.getUTCMonth() + 1}`);

                                    result.active.push(item.active);
                                    result.new.push(item.installs);
                                    result.deletions.push(item.uninstalls);

                                    $scope.summary.new += item.installs;
                                    $scope.summary.deletion += item.uninstalls;

                                }

                                $scope.summary.active = result.active[result.active.length - 1];
                                resolve(result);

                            })

                        });
                    }

                }

                function setFilterDates(deltaType = "week") {

                    const deltaWeek = 604800000;
                    let delta;
                    let result = {};

                    switch (deltaType) {
                        case "week":
                            delta = deltaWeek;
                            break;
                        case "month":
                            delta = 2629746000;
                            break;
                        default:   
                            delta = deltaWeek; 
                    }

                    result.start = new Date();
                    result.start.setTime(result.start.getTime() - delta);
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