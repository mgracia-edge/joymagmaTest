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
        .controller("sPrivateCloudCtrl", ['$scope', '$interval', '$NxApi', '$location'
            , function ($scope, $interval, $NxApi, $location) {

                $scope.loading = true;
                $scope.privateCloudConfig = {};

                $scope.entryPointItems = entryPointItems;
                $scope.transcoderItems = transcoderItems;
                $scope.edgeserverItems = edgeserverItems;
                $scope.packagerItems = packagerItems;

                function init() {

                    $NxApi.privateCloud
                        .getConfig()
                        .then((privateCloudConfig) => {
                            $scope.privateCloudConfig = privateCloudConfig;
                        })
                        .catch((error) => {
                            console.log(error);

                        })
                }

                function entryPointItems(server) {

                    if (!server) return [];

                    if (typeof server.resumeItems === "undefined") {
                        server.resumeItems = [];

                        $NxApi.privateCloud
                            .getEntrypointCondition(server.ip)
                            .then((privateCloudConfig) => {
                                server.resumeItems = [
                                    {
                                        label: "Up Time",
                                        data: formatUptime(privateCloudConfig.serverStats.uptime.uptime)
                                    },
                                    {
                                        label: "Incoming Feeds",
                                        data: privateCloudConfig.entryPointTasks.length + " channels"
                                    },
                                    {
                                        label: "CPU Load",
                                        data: Math.round(100 * privateCloudConfig.serverStats.ioStats.cpuLoad.total) / 100 + " %"
                                    },
                                    {
                                        label: "Disk Reading",
                                        data: Math.round(100 * privateCloudConfig.serverStats.ioStats.diskStats.totals.readRatio) / 100 + " kB/s"
                                    },
                                    {
                                        label: "Disk Writing",
                                        data: Math.round(100 * privateCloudConfig.serverStats.ioStats.diskStats.totals.writeRatio) / 100 + " kB/s"
                                    }
                                ];
                            })
                            .catch((error) => {
                                console.log(error);

                            })

                    }


                    return server.resumeItems;
                }

                function transcoderItems(server) {

                    if (!server) return [];

                    if (typeof server.resumeItems === "undefined") {
                        server.resumeItems = [];

                        $NxApi.privateCloud
                            .getTranscoderCondition(server.ip)
                            .then((privateCloudConfig) => {
                                server.resumeItems = [
                                    {
                                        label: "Up Time",
                                        data: formatUptime(privateCloudConfig.serverStats.uptime.uptime)
                                    },
                                    {
                                        label: "Transcoding tasks",
                                        data: privateCloudConfig.transcoderTasks.length + " tasks"
                                    },
                                    {
                                        label: "CPU Load",
                                        data: Math.round(100 * privateCloudConfig.serverStats.ioStats.cpuLoad.total) / 100 + " %"
                                    },
                                    {
                                        label: "Disk Reading",
                                        data: Math.round(100 * privateCloudConfig.serverStats.ioStats.diskStats.totals.readRatio) / 100 + " kB/s"
                                    },
                                    {
                                        label: "Disk Writing",
                                        data: Math.round(100 * privateCloudConfig.serverStats.ioStats.diskStats.totals.writeRatio) / 100 + " kB/s"
                                    }
                                ];
                            })
                            .catch((error) => {
                                console.log(error);

                            })

                    }


                    return server.resumeItems;
                }

                function edgeserverItems() {
                    return [];
                }

                function packagerItems() {
                    return [];
                }

                $NxApi.setAfterLogin(init);

            }]);


    function formatUptime(timeInSec) {

        let str = "";
        let rst = timeInSec;

        const DAY = 86400;
        const HOUR = 3600;
        const MINUTE = 60;

        if (rst > DAY) {
            str += Math.floor(rst / DAY) + "d ";
            rst -= Math.floor(rst / DAY) * DAY
        }

        if (rst > HOUR) {
            str += Math.floor(rst / HOUR) + "h ";
            rst -= Math.floor(rst / HOUR) * HOUR
        }

        if (rst > MINUTE) {
            str += Math.floor(rst / MINUTE) + "m";
            rst -= Math.floor(rst / MINUTE) * MINUTE
        }


        return str;

    }

})();