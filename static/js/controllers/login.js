/**
 * Created by Matheus Alves on 14/05/2016.
 */

'use strict';

function LoginController ($scope, $state, $http, $location, $cookieStore) {
    $scope.showModal = false;
    $scope.modalText = '';

    $scope.hideModal = function(){
        $scope.showModal = false;
    };
    
    function showModal (message) {
        $scope.modalText = message;
        $scope.showModal = true;
    }

    function validateParams () {
        if ($scope.username && $scope.password) {
            $scope.username = $scope.username.trim();
            $scope.password = $scope.password.trim();

            if ($scope.username.length > 0 && $scope.password.length > 0) {
                return true;
            }
        }

        return false;
    }

    $scope.validate = function (type) {
        if (!validateParams()) {
            showModal('Please provide a valid username and password');
        } else {
            var data = {
                username: $scope.username,
                password: $scope.password
            };

            var path;
            var errorMessage;

            if (type === 'login') {
                path = '/login';
                errorMessage = 'Error authenticating user : ';
            } else if (type === 'register') {
                path = '/register';
                errorMessage = 'Error registering user : ';
            }

            $http.post(buildUrl($location, path), data).
            then(function(response) {
                $cookieStore.put('token', response.data.token);
                $cookieStore.put('username', $scope.username);
                
                $state.go('chat');
            }, function(error) {
                showModal(errorMessage + error.data);
            });
        }
    };
}

angular.module('privateChat').controller('login', LoginController);