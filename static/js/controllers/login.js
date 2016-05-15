/**
 * Created by Matheus Alves on 14/05/2016.
 */

'use strict';

function LoginController ($scope, $state, $http, $location) {
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

    $scope.validateLogin = function () {
        if (!validateParams()) {
            showModal('Please provide a valid username and password');
        } else {
            var loginData = {
                username: $scope.username,
                password: $scope.password
            };

            $http.post(buildUrl($location, '/login'), loginData).
            then(function(response) {
                $state.go('chat', {username: $scope.username});
            }, function(error) {
                showModal('Error authenticating user : ' + error.data);
            });
        }
    };
    $scope.validateRegistry = function () {
        if (!validateParams()) {
            showModal('Please provide a valid username and password');
        } else {
            var registryData = {
                username: $scope.username,
                password: $scope.password
            };

            $http.post(buildUrl($location, '/register'), registryData).
            then(function(response) {
                $state.go('chat', {username: $scope.username});
            }, function(error) {
                showModal('Error registering user : ' + error.data);
            });
        }
    };
}

angular.module('privateChat').controller('login', LoginController);