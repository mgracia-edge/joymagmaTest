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

            const permissions = {
                USER_ADMIN: "user.admin",
                PRIVATE_CLOUD_ADMIN: "privatecloud.admin",
                PRODUCTS_WRITE: "products.write",
                PRODUCTS_READ: "products.read",
                CHANNELS_WRITE: "channels.write",
                CHANNELS_READ: "channels.read",
                STATS_ACCESS: "stats.access",
                SUBSCRIBERS_READ: "subscribers.read"
            };

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
                            /*{
                                iconURL: "/res/drawable/ic_live_alt.svg",
                                name: "Live Feeds",
                                path: "/s/ott/channel"
                            },*/
                            {
                                iconURL: "/res/drawable/ic_playlist.svg",
                                name: "Private Cloud",
                                path: "/s/infra/private-cloud"
                            }
                        ],
                    },
                    {
                        name: "Publishing",
                        items: [
                            {
                                iconURL: "/res/drawable/ic_show.svg",
                                name: "Channels",
                                path: "/s/ott/channel"
                            },
                            {
                                iconURL: "/res/drawable/ic_package.svg",
                                name: "Package",
                                path: "/s/ott/products"
                            },
                            {
                                iconURL: "/res/drawable/ic_channel.svg",
                                name: "Categories",
                                path: "/s/ott/categories"
                            }
                        ]
                    },
                    {
                        name: "OTT",
                        items: [
                            {
                                iconURL: "/res/drawable/ic_subscribers.svg",
                                name: "Subscribers",
                                path: "/s/ott/subscribers"
                            },
                            {
                                iconURL: "/res/drawable/ic_epg_monitor.svg",
                                name: "EPG Monitor",
                                path: "/s/ott/epg_monitor"
                            },
                            {
                                iconURL: "/res/drawable/ic_ott_project.svg",
                                name: "Config",
                                path: "/s/ott/config"
                            },
                            {
                                iconURL: "/res/drawable/ic_statistics.svg",
                                name: "Statistics",
                                path: "/s/ott/statistics"
                            }]

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

                ].filter(checkPermissions);

                function checkPermissions(item) {

                    if (item.name === "Assets (PC)") {
                        return user.permissions.includes(permissions.PRIVATE_CLOUD_ADMIN);
                    }

                    return true;
                }

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