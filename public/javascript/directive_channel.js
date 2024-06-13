(function () {
    angular.module('NxStudio')
        .directive("nxChannel", function () {
            return {
                restrict: 'E',
                require: '?ngModel',
                templateUrl: "/res/layout/directive_channel.html",
                link: link,
                controller: ["$scope", controller]
            }
        });


    function link(scope, element, attributes, ngModel) {

        scope.channel = scope.item;

        let chart_data = [];
        let char_labels = [];

        for(let i in scope.channel.stats){
            chart_data.push(scope.channel.stats[i].concurrency);
            char_labels.push(scope.channel.stats[i].timestamp);
        }

        let ctx = element[0].getElementsByTagName("canvas")[0];
        ctx.height = 100;
        let myBarChart = new Chart(ctx, {
            "type": "bar",
            "data": {
                "labels": char_labels,
                "datasets": [
                    {
                        "label": "Concurrency",
                        "data": chart_data,
                        "fill": true,
                        "backgroundColor": '#42516E',
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
                    display: false,
                    labels: {
                        fontColor: 'rgb(255, 99, 132)'
                    }
                },
                title: {
                    display: false
                },
                tooltips: {
                    enabled: false,
                    display: false,
                },
                scales: {
                    xAxes: [{
                        stacked: true,
                        display: false,
                    }],
                    yAxes: [{
                        display: false,
                        stacked: true
                    }]
                }
            }
        });

    }

    function controller(scope) {

    }


})();
