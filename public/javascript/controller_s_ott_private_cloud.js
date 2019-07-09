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
        .controller("sPrivateCloudCtrl", ['$scope', '$interval', '$NxApi', '$location', '$routeParams'
            , function ($scope, $interval, $NxApi, $location, $routeParams) {

                $scope.loading = true;
                $scope.privateCloudConfig = {};

                $scope.entryPointItems = entryPointItems;
                $scope.transcoderItems = transcoderItems;
                $scope.edgeserverItems = edgeserverItems;
                $scope.packagerItems = packagerItems;
                $scope.openServer = openServer;

                function init() {

                    $NxApi.privateCloud
                        .getConfig()
                        .then((privateCloudConfig) => {
                            $scope.privateCloudConfig = privateCloudConfig;
                        })
                        .catch((error) => {

                        })


                }

                function entryPointItems(server) {

                    if (!server) return [];

                    if (typeof server.resumeItems === "undefined") {
                        server.resumeItems = [];

                        server.loading = true;

                        $NxApi.privateCloud
                            .getEntrypointCondition(server.ip)
                            .then((privateCloudConfig) => {


                                server.loading = false;
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
                                        label: "I/O Waits",
                                        data: Math.round(100 * privateCloudConfig.serverStats.ioStats.cpuLoad.iowait) / 100 + " %"
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
                                console.error(error);

                            })

                    }


                    return server.resumeItems;
                }

                function transcoderItems(server) {

                    if (!server) return [];

                    if (typeof server.resumeItems === "undefined") {
                        server.resumeItems = [];
                        server.loading = true;


                        $NxApi.privateCloud
                            .getTranscoderCondition(server.ip)
                            .then((privateCloudConfig) => {

                                server.loading = false;

                                let gpu_enc = 0,
                                    gpu_dec = 0,
                                    gpu_mem = 0;

                                for (let task of privateCloudConfig.transcoderTasks) {

                                    if (task.gpu) {
                                        gpu_enc += task.gpu.enc;
                                        gpu_dec += task.gpu.dec;
                                        gpu_mem += task.gpu.fb;
                                    }

                                }

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
                                        label: "GPU Encoding",
                                        data: Math.round(100 * gpu_enc) / 100 + " %"
                                    },
                                    {
                                        label: "GPU Decoding",
                                        data: Math.round(100 * gpu_dec) / 100 + " %"
                                    },
                                    {
                                        label: "GPU Memory",
                                        data: Math.round(100 * gpu_mem) / 100 + " MB"
                                    },
                                    {
                                        label: "I/O Waits",
                                        data: Math.round(100 * privateCloudConfig.serverStats.ioStats.cpuLoad.iowait) / 100 + " %"
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
                                console.error(error);
                            })

                    }


                    return server.resumeItems;
                }

                function edgeserverItems() {
                    return [];
                }

                function packagerItems(server) {


                    if (!server) return [];

                    if (typeof server.resumeItems === "undefined") {
                        server.resumeItems = [];

                        server.loading = true;

                        $NxApi.privateCloud
                            .getPackagerCondition(server.ip)
                            .then((privateCloudConfig) => {

                                server.loading = false;
                                server.resumeItems = [
                                    {
                                        label: "Up Time",
                                        data: formatUptime(privateCloudConfig.serverStats.uptime.uptime)
                                    },
                                    {
                                        label: "CPU Load",
                                        data: Math.round(100 * privateCloudConfig.serverStats.ioStats.cpuLoad.total) / 100 + " %"
                                    },
                                    {
                                        label: "I/O Waits",
                                        data: Math.round(100 * privateCloudConfig.serverStats.ioStats.cpuLoad.iowait) / 100 + " %"
                                    },
                                    {
                                        label: "Disk Reading",
                                        data: Math.round(100 * privateCloudConfig.serverStats.ioStats.diskStats.totals.readRatio) / 100 + " kB/s"
                                    },
                                    {
                                        label: "Disk Writing",
                                        data: Math.round(100 * privateCloudConfig.serverStats.ioStats.diskStats.totals.writeRatio) / 100 + " kB/s"
                                    },
                                    {
                                        label: "Nginx CPU Load",
                                        data: Math.round(100 * privateCloudConfig.packagerStats.nginx.cpu) / 100 + " %"
                                    },
                                    {
                                        label: "Nginx Mem",
                                        data: Math.round(100 * privateCloudConfig.packagerStats.nginx.mem / 1024) / 100 + " kB/s"
                                    }

                                ];
                            })
                            .catch((error) => {
                                console.error(error);

                            })

                    }

                    return server.resumeItems;
                }

                function openServer(server) {
                    $location.path(`/s/infra/private-cloud/${server.role}/${server.ip}`)
                }

                $NxApi.setAfterLogin(init);

            }]);

    angular.module('NxStudio')
        .controller("sPrivateCloudDetailCtrl", ['$scope', '$interval', '$NxApi', '$location', '$routeParams', '$mdDialog'
            , function ($scope, $interval, $NxApi, $location, $routeParams, $mdDialog) {

                $scope.role = $routeParams.role;
                $scope.ip = $routeParams.ip;
                $scope.privateCloudConfig = null;
                $scope.templateURL = null;
                $scope.server = null;
                $scope.channels = [];


                $scope.transcoderItems = transcoderItems;
                $scope.getChannel = getChannel;
                $scope.getTranscoderName = getTranscoderName;
                $scope.restartEntrypoint = restartEntrypoint;

                function init() {

                    $NxApi.channels.read({}).then(channels => {
                        $scope.channels = channels;
                    });

                    $NxApi.privateCloud
                        .getConfig()
                        .then((privateCloudConfig) => {

                            $scope.privateCloudConfig = privateCloudConfig;

                            for (let server of $scope.privateCloudConfig[$scope.role]) {
                                if (server.ip === $scope.ip) {
                                    $scope.server = server;
                                }
                            }

                            switch ($routeParams.role) {
                                case "entrypoint": {
                                    $NxApi.privateCloud.getEntrypointCondition($routeParams.ip).then(initEntrypoint);
                                    break;
                                }

                                case "transcoder": {
                                    $NxApi.privateCloud.getTranscoderCondition($routeParams.ip).then(initTranscoder);
                                    break;
                                }

                                case "packager": {
                                    $NxApi.privateCloud.getPackagerCondition($routeParams.ip).then(initPackager);
                                    break;
                                }

                                case "edgeserver": {
                                    $NxApi.privateCloud.getEdgeserverCondition($routeParams.ip).then(initEdgeserver);
                                    break;
                                }
                            }

                        })
                        .catch((error) => {

                        })


                }

                function getChannel(hash) {
                    for (let channel of $scope.channels) {

                        if (channel.entryPoint.streamKey === hash || channel.publishing[0].streamName === hash) {
                            return channel;
                        }
                    }

                    return null
                }

                function getTranscoderName(ip) {
                    for (let t of $scope.privateCloudConfig.transcoder) {
                        if (t.ip === ip || t.ip2 === ip)
                            return t.name;
                    }

                    return "-";
                }

                function transcoderItems() {
                    if ($scope.server && $scope.server.resumeItems) {
                        return $scope.server.resumeItems;
                    } else {
                        return [];
                    }
                }

                function restartEntrypoint(task, $event) {

                    let confirm = $mdDialog.confirm()
                        .title(`Restarting ${getChannel(task.inStream).name}.`)
                        .textContent(`Confirm you want to restart de connection between the 
                        Entrypoint and the Transcoder for the channel ${getChannel(task.inStream).name}.`)
                        .ariaLabel('Restarting Entrypoint')
                        .targetEvent($event)
                        .ok('Restart Connection')
                        .cancel('Cancel');

                    $mdDialog.show(confirm).then(function () {
                        console.log("CONFIRM")
                    }, function () {

                    });
                }

                function initEntrypoint(serverCondition) {
                    $scope.templateURL = "/res/layout/view_s_private_cloud_entrypoint.html";

                    $scope.serverCondition = serverCondition;

                    $scope.server.resumeItems = [
                        {
                            label: "Up Time",
                            data: formatUptime(serverCondition.serverStats.uptime.uptime)
                        },
                        {
                            label: "Incoming Feeds",
                            data: serverCondition.entryPointTasks.length + " channels"
                        },
                        {
                            label: "CPU Load",
                            data: Math.round(100 * serverCondition.serverStats.ioStats.cpuLoad.total) / 100 + " %"
                        },
                        {
                            label: "I/O Waits",
                            data: Math.round(100 * serverCondition.serverStats.ioStats.cpuLoad.iowait) / 100 + " %"
                        },
                        {
                            label: "Disk Reading",
                            data: Math.round(100 * serverCondition.serverStats.ioStats.diskStats.totals.readRatio) / 100 + " kB/s"
                        },
                        {
                            label: "Disk Writing",
                            data: Math.round(100 * serverCondition.serverStats.ioStats.diskStats.totals.writeRatio) / 100 + " kB/s"
                        }
                    ];

                }

                function initTranscoder(serverCondition) {

                }

                function initPackager(serverCondition) {

                }

                function initEdgeserver(serverCondition) {

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