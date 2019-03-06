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
    const C = {};

    angular.module('NxStudio')
        .factory('$NxNav', ['$http', '$q', function ($http, $q) {


            let mainBar = {
                hidden: true
            };

            let navPanel = {
                hidden: true
            };


            function hide() {
                mainBar.hidden = true;
                navPanel.hidden = true;
            }

            function show() {
                mainBar.hidden = false;
                navPanel.hidden = false;
            }

            function loadRootLevel(user, account) {
                navPanel.currentAccount = account;
                navPanel.currentMap = [
                    {
                        name: "Assets (PC)",
                        items: [
                            {
                                iconURL: "/res/drawable/ic_live_alt.svg",
                                name: "Live Feeds",
                                path: "/s/ott/channel"
                            },
                            {
                                iconURL: "/res/drawable/ic_vod.svg",
                                name: "On Demand",
                                path: "/s/n/a"
                            }
                        ],
                    },
                    {
                        name: "OTT",
                        items: [
                            {
                                iconURL: "/res/drawable/ic_show.svg",
                                name: "Channels",
                                path: "/s/ott/channel"
                            },
                            {
                                iconURL: "/res/drawable/ic_channel.svg",
                                name: "Package",
                                path: "/s/ott/products"
                            },
                            {
                                iconURL: "/res/drawable/ic_ott_project.svg",
                                name: "Config",
                                path: "/s/ott/settings"
                            }
                        ]
                    },
                    {
                        name: "Account",
                        items: [
                            {
                                iconURL: "/res/drawable/ic_settings.svg",
                                name: "Settings",
                                path: "/s/account/settings"
                            }
                        ]
                    }

                ];
            }


            return {
                hide: hide,
                show: show,
                mainBar: mainBar,
                navPanel: navPanel,
                loadRootLevel: loadRootLevel
            }

        }]);
})();