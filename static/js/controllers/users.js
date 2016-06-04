/**
 * Created by Matheus Alves on 14/05/2016.
 */

'use strict';

// Constants
var GET_USERS_TIMEOUT = 5000; //five seconds

function UsersController ($scope, $state, $stateParams, $http, $location, $timeout, webSocket, $cookieStore) {
    $scope.users = {};

    // To recover conversation on page refresh
    if ($cookieStore.get('otherUser')) {
        $stateParams.otherUser = $cookieStore.get('otherUser');
    }

    function getUsers () {
        var config = createHeaders($cookieStore);

        $http.get(
            buildUrl($location, '/users/' + $cookieStore.get('username') + '?otherUser=' + $stateParams.otherUser),
            config).
        then(function(response) {
            for (var user in response.data) {
                $scope.users[user] = response.data[user];
            }

            $timeout(getUsers, GET_USERS_TIMEOUT);
        }, function(error) {
            alert('Error fetching users: ' + error.data);
        });
    }
    getUsers();

    webSocket.on('newMessage/' + $cookieStore.get('username'), function (data) {
        if (data != $stateParams.otherUser) { // only count unread messages
            $scope.users[data]++;
        }
    });

    $scope.selectUser = function (selectedUser) {
        $scope.users[selectedUser] = 0;
        $cookieStore.put('otherUser', selectedUser);
        $state.go('chat.private', {otherUser: selectedUser});
    }
}

angular.module('privateChat').controller('users', UsersController);
