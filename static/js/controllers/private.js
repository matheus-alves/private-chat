/**
 * Created by Matheus Alves on 14/05/2016.
 */

'use strict';

function PrivateChatController ($scope, $stateParams, $http, $location, webSocket) {
    $scope.messages = [];

    function getHistory () {
        $http.get(buildUrl($location, '/history/' + $stateParams.username + '/' + $stateParams.otherUser)).
        then(function(response) {
            $scope.messages = response.data;
        }, function(error) {
            alert('Error fetching history');
        });
    }
    getHistory();

    webSocket.on('message/' + $stateParams.otherUser + '/' + $stateParams.username, function (data) {
        $scope.messages.push({origin: $stateParams.otherUser, value: data});
    });

    $scope.sendMessage = function () {
        $scope.typedMessage = $scope.typedMessage.trim();

        if ($scope.typedMessage.length > 0) {
            webSocket.emit('sendMessage', {
                origin: $stateParams.username,
                target: $stateParams.otherUser,
                value: $scope.typedMessage
            });

            $scope.messages.push({origin: $stateParams.username, value: $scope.typedMessage});
            $scope.typedMessage = '';
        }
    };
}

angular.module('privateChat').controller('private', PrivateChatController);