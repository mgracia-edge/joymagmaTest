export default function AudienceCtrl($scope, $timeout, Chart, cleanUp, $NxApi) {

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