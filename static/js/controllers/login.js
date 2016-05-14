/**
 * Created by Matheus Alves on 14/05/2016.
 */

'use strict';

function LoginController ($scope, $state) {
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
            alert('Please provide a valid username and password');
        } else {
            // TODO server communication
            $state.go('chat', {username: $scope.username})
        }
    };
    $scope.validateRegistry = function () {
        if (!validateParams()) {
            alert('Please provide a valid username and password');
        } else {
            // TODO server communication
            $state.go('chat', {username: $scope.username})
        }
    };
}

angular.module('privateChat').controller('login', LoginController);