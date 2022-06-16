export default function ContentCtrl($scope, $timeout, Chart, cleanUp, $NxApi, randomColor) {

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