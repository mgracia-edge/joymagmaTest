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
        .factory('$NxDialogs', ['$http', '$q','$mdDialog', function ($http, $q,$mdDialog) {


            function showAdd($event){

                let addDialog = {
                    templateUrl: "/res/layout/fragment_dialog_add.html",
                    controller: controller,

                };
                
                
                function controller($scope, $mdDialog) {

                    $scope.cancel = cancel;


                    function cancel() {
                        $mdDialog.hide()
                    }

                    
                }

                $mdDialog.show(addDialog);

            }




            return {
                showAdd: showAdd
            }

        }]);


})();