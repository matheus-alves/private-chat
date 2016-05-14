/**
 * Created by Matheus Alves on 14/05/2016.
 */

'use strict';

// Constants
var GET_USERS_TIMEOUT = 5000; //five seconds

function UsersController ($scope, $state, $stateParams, $http, $location, $timeout) {
    $scope.users = {};
    
    function getUsers () {
        $http.get(buildUrl($location, '/users')).
        then(function(response) {
            for (var user in response.data) {
                if (user != $stateParams.username) {
                    $scope.users[user] = response.data[user];
                }
            }

            $timeout(getUsers, GET_USERS_TIMEOUT);
        }, function(error) {
            alert('Error fetching users');
        });
    }
    getUsers();
    
    $scope.selectUser = function (selectedUser) {
        // TODO server communication
        $state.go('chat.private', {otherUser: selectedUser});
    }
}

angular.module('privateChat').controller('users', UsersController);
