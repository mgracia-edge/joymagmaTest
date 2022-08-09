export default function GridAudienceCtrl($scope, $timeout, Chart, cleanUp, $NxApi, randomColor) {

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