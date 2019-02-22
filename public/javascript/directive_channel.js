(function () {
    angular.module('NxStudio')
        .directive("nxChannel", function() {
            return {
                restrict: 'E',
                templateUrl: "/res/layout/directive_channel.html",
                scope:{},
                controller: controller
            }
        });


    function controller($scope) {

        function init(){
            console.log($scope.$parent.channel)
            let ctx = document.getElementById("myChart");
            ctx.height = 100;
            let myBarChart = new Chart(ctx, {
                "type": "bar",
                "data": {
                    "labels": ["January", "February", "March", "April", "May", "June", "s","as", "s","as", "s","as", "s","as"],
                    "datasets": [
                        {
                            "label": "My First Dataset",
                            "data": [56, 39, 30, 31, 26, 35, 40,55, 59, 80, 81, 86, 95, 100],
                            "fill": true,
                            "backgroundColor": '#42516E',
                            //"borderColor": ["rgb(255, 99, 132)", "rgb(255, 159, 64)", "rgb(255, 205, 86)", "rgb(75, 192, 192)", "rgb(54, 162, 235)", "rgb(153, 102, 255)", "rgb(201, 203, 207)","rgb(255, 99, 132)", "rgb(255, 159, 64)", "rgb(255, 205, 86)", "rgb(75, 192, 192)", "rgb(54, 162, 235)", "rgb(153, 102, 255)", "rgb(201, 203, 207)"],
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

        init();



    }


})();
