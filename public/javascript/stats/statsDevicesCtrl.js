export default function DevicesCtrl($scope, $timeout, Chart, cleanUp, $NxApi) {

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

                    result.date.push(date);
                    
                    result.android.push(androidKey ?? 0);
                    $scope.summary.android += androidKey ?? 0;
                
                    result.androidTv.push(androidTvKey ?? 0);
                    $scope.summary.androidTv += androidTvKey ?? 0;

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