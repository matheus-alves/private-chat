/**
 * Created by Matheus Alves on 14/05/2016.
 */

'use strict';

// Constants
var GET_USERS_TIMEOUT = 5000; //five seconds

function UsersController ($scope, $state, $stateParams, $http, $location, $timeout, webSocket) {
    $scope.users = {};

    function getUsers () {
        $http.get(buildUrl($location, '/users/' + $stateParams.username)).
        then(function(response) {
            for (var user in response.data) {
                if (!$scope.users[user]) { // only add new users
                    $scope.users[user] = response.data[user];
                }
            }

            $timeout(getUsers, GET_USERS_TIMEOUT);
        }, function(error) {
            alert('Error fetching users');
        });
    }
    getUsers();

    webSocket.on('newMessage/' + $stateParams.username, function (data) {
        if ($stateParams.otherUser != data) { // only count unread messages
            $scope.users[data]++;
        }
    });

    $scope.selectUser = function (selectedUser) {
        // TODO server communication
        $scope.users[selectedUser] = 0;
        $state.go('chat.private', {otherUser: selectedUser});
    }
}

angular.module('privateChat').controller('users', UsersController);
