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
    const C = {}

    angular.module('NxStudio')
        .factory('$NxNav', ['$http', '$q', function ($http, $q) {


            let mainBar = {
                hidden: true
            }

            let navPanel = {
                hidden: true
            }


            function hide() {
                mainBar.hidden = true;
                navPanel.hidden = true;
            }

            function show() {
                mainBar.hidden = false;
                navPanel.hidden = false;
            }


            return {
                hide:hide,
                show:show,
                mainBar: mainBar,
                navPanel: navPanel
            }

        }]);
})();