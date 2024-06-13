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
        .controller("sAccountSettingsCtrl",
            ['$scope', '$NxApi', '$mdToast', '$location','$q',
                function ($scope, $NxApi, $mdToast, $location,$q) {

            $scope.acount = {
                logo: '',
                name: '',
                description: '',
                services: []
            };

            $scope.account_users = account_users;
            $scope.updateAccount = updateAccount;
            $scope.uploadImage = uploadImage;

            function init() {
                let user = $NxApi.getUser();

                if(user){
                    $NxApi.getAccount(user.account).then((account) => {
                        let {name, logo, description, services,_id} = account;

                        $scope.acount = {
                            _id,
                            name,
                            logo,
                            description,
                            services
                        }
                    })
                }

            }

            function account_users(){
                $location.path("/s/account/settings/users")
            }

            function toast(msg) {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent(msg)
                        .hideDelay(5000))
                    .then(function () {
                    }).catch(function () {
                });
            }

            function checkForm() {

                let {name, description} = $scope.acount;

                if (name !== '' && description !== '') {
                    return true
                }

                toast("The fields cannot be empty");

                return false
            }

            function _getImage() {
                return $q((resolve, reject) => {
                    let file = document.createElement('input');
                    let maxSize = 500; //kb
                    file.type = 'file';
                    file.click();

                    file.addEventListener('change', function () {

                        if (file.files[0].size / 1000 > maxSize) {
                            reject(`The image can not be larger than ${maxSize}kb`)
                        }

                        let reader = new FileReader();

                        reader.onloadend = function () {
                            resolve(reader.result)
                        };

                        reader.readAsDataURL(file.files[0]);
                    })
                })
            }

            function uploadImage() {
                _getImage().then((img) => {
                    $scope.acount.logo = {
                        update:true,
                        url:img
                    };
                }).catch((error) => {
                    toast(error);
                })
            }

            function updateAccount(){
                if(checkForm()){

                    $scope.loading = true;

                    $NxApi.account
                        .update($scope.acount)
                        .then(() => {
                            toast('The account was update');
                            $scope.loading = false;
                            if($scope.user.photo) $scope.user.photo.update = false;

                        })
                        .catch((error) => {
                            console.log(error);
                            $scope.loading = false;
                        })

                }
            }

            $NxApi.setAfterLogin(init);

        }]);
})();