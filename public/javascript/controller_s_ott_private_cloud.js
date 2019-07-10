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

                let mServer = null;

                $scope.role = $routeParams.role;
                $scope.ip = $routeParams.ip;
                $scope.privateCloudConfig = null;
                $scope.templateURL = null;
                $scope.server = null;
                $scope.channels = [];

                $scope.transcoderItems = transcoderItems;
                $scope.getChannel = getChannel;
                $scope.getTranscoder = getTranscoder;
                $scope.getPackager = getPackager;
                $scope.restartEntrypoint = restartEntrypoint;
                $scope.restartTranscoder = restartTranscoder;
                $scope.testEntrypointInput = testEntrypointInput;
                $scope.testTxInput = testTxInput;
                $scope.testTxStream = testTxStream;
                $scope.openTranscoder = openTranscoder;
                $scope.openChannel = openChannel;
                $scope.formatUptime = formatUptime;
                $scope.gpuResume = gpuResume;

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
                                    mServer = server;
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

                function getTranscoder(ip) {
                    for (let t of $scope.privateCloudConfig.transcoder) {
                        if (t.ip === ip || t.ip2 === ip)
                            return t;
                    }
                    return null;
                }

                function getPackager(ip) {
                    for (let t of $scope.privateCloudConfig.packager) {
                        if (t.ip === ip || t.ip2 === ip)
                            return t;
                    }
                    return null;
                }

                function getEntrypoint(ip) {
                    for (let t of $scope.privateCloudConfig.entrypoint) {
                        if (t.ip === ip || t.ip2 === ip)
                            return t;
                    }
                    return null;
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


                        $NxApi.privateCloud.killPid({
                            role: "entrypoint",
                            ip: mServer.ip,
                            pid: task.pid
                        }).then(result => {
                            console.log(result);
                            init();
                        })


                    }, function () {

                    });
                }

                function restartTranscoder(task, $event) {
                    let confirm = $mdDialog.confirm()
                        .title(`Restarting ${getChannel(task.hash).name}.`)
                        .textContent(`Confirm you want to restart de connection between the 
                        Entrypoint and the Transcoder for the channel ${getChannel(task.hash).name}.`)
                        .ariaLabel('Restarting Entrypoint')
                        .targetEvent($event)
                        .ok('Restart Connection')
                        .cancel('Cancel');

                    $mdDialog.show(confirm).then(function () {


                        $NxApi.privateCloud.killPid({
                            role: "transcoder",
                            ip: mServer.ip,
                            pid: task.pid
                        }).then(result => {
                            console.log(result);
                            init();
                        })


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
                    $scope.templateURL = "/res/layout/view_s_private_cloud_transcoder.html";

                    $scope.serverCondition = serverCondition;

                    let gpu_enc = 0,
                        gpu_dec = 0,
                        gpu_mem = 0;

                    for (let task of serverCondition.transcoderTasks) {

                        if (task.gpu) {
                            gpu_enc += task.gpu.enc;
                            gpu_dec += task.gpu.dec;
                            gpu_mem += task.gpu.fb;
                        }

                    }

                    $scope.server.resumeItems = [
                        {
                            label: "Up Time",
                            data: formatUptime(serverCondition.serverStats.uptime.uptime)
                        },
                        {
                            label: "Transcoding tasks",
                            data: serverCondition.transcoderTasks.length + " tasks"
                        },
                        {
                            label: "CPU Load",
                            data: Math.round(100 * serverCondition.serverStats.ioStats.cpuLoad.total) / 100 + " %"
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

                function initPackager(serverCondition) {

                }

                function initEdgeserver(serverCondition) {

                }

                function openTranscoder(task) {
                    $location.path(`s/infra/private-cloud/transcoder/${getTranscoder(task.targetServer).ip}`)
                }

                function openChannel(task) {
                    if (task.hash) {
                        $location.path(`s/ott/channel/${getChannel(task.hash)._id}`)

                    } else {
                        $location.path(`s/ott/channel/${getChannel(task.inStream)._id}`)
                    }
                }

                function testTxInput(task, event) {

                    streamingTestDialog({
                        protocol: "rtmp",
                        host: getTranscoder(task.targetServer).ip,
                        port: task.targetPort,
                        app: task.targetApp,
                        streamname: task.outStream
                    }, task, event)
                }

                function testTxStream(task, event) {

                    console.log(task);

                    let streams = [];

                    let targetServer = getPackager(task.target.server).ip;

                    for (let o of  task.target.outs) {
                        streams.push({
                            protocol: "rtmp",
                            host: targetServer,
                            port: task.target.port,
                            app: task.target.app,
                            streamname: o.stream
                        })
                    }

                    streamingTestDialog(streams, task, event)
                }

                function testEntrypointInput(task, event) {

                    streamingTestDialog({
                        protocol: "rtmp",
                        host: mServer.ip,
                        port: task.sourcePort,
                        app: task.sourceApp,
                        streamname: task.inStream
                    }, task, event);
                }

                function streamingTestDialog(pSource, task, event) {

                    let source;

                    if (Array.isArray(pSource)) {
                        source = pSource[0];
                    } else {
                        source = pSource;
                    }

                    let dialog = {
                        controller: DialogController,
                        templateUrl: "/res/layout/dialog_private_cloud_stream_inspector.html",
                        target: event,
                        clickOutsideToClose: true
                    };

                    $mdDialog.show(dialog);

                    function DialogController($scope) {

                        let protocol = source.protocol,
                            host = source.host,
                            port = source.port,
                            app = source.app,
                            streamname = source.streamname;

                        $scope.busy = false;

                        $scope.rtmpTestingSource = `${protocol}://${host}:${port}/${app}/${streamname}`;

                        $scope.doMediaInfo = doMediaInfo;
                        $scope.doSnapshot = doSnapshot;
                        $scope.doPlayback = doPlayback;

                        function doPlayback() {


                        }

                        function doSnapshot() {

                            let element = document.getElementById("dialog-result-display");

                            let video = document.createElement("video");

                            let id = (Date.now()).toString(32);

                            element.innerHTML = "";

                            console.log(`http://200.2.125.60:10888/api/snapshot/${encodeURIComponent($scope.rtmpTestingSource)}/play.mp4`);

                            video.id = id;
                            video.controls = "true";
                            video.autoplay = "true";
                            video.className = "video-js vjs-default-skin vjs-big-play-centered video-container";
                            video.src = `http://200.2.125.60:10888/api/snapshot/${encodeURIComponent($scope.rtmpTestingSource)}/play.mp4`;

                            element.append(video)

                            videojs(id);

                        }

                        function doMediaInfo() {
                            let element = document.getElementById("dialog-result-display");

                            $scope.busy = true;
                            $NxApi.privateCloud.mediainfo($scope.rtmpTestingSource, "text").then(response => {
                                    $scope.busy = false;
                                    let pre = document.createElement("pre");

                                    pre.innerText = response.text;
                                    pre.style.background = "#353535";
                                    pre.style.color = "#ddd";
                                    pre.style.fontWeight = "800";
                                    pre.style.padding = "#10px";
                                    pre.style.borderRadius = "5px";

                                    element.innerHTML = "";
                                    element.style.display = "block";
                                    element.appendChild(pre);
                                }
                            )

                        }

                    }
                }

                $NxApi.setAfterLogin(init);

            }]);

    function gpuResume(task) {
        if (task.gpu) {
            return `${Math.round(10 * task.gpu.dec) / 10}%, ${Math.round(10 * task.gpu.enc) / 10}%, ${Math.round(task.gpu.mem * 10) / 10}%`;
        } else {
            return "-";
        }
    }

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