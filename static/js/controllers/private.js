/**
 * Created by Matheus Alves on 14/05/2016.
 */

'use strict';

function PrivateChatController ($scope, $stateParams, $http, $location, webSocket, $cookieStore) {
    $scope.messages = [];
    
    // To recover conversation on page refresh
    if ($cookieStore.get('otherUser')) {
        $stateParams.otherUser = $cookieStore.get('otherUser');
    }

    function getHistory () {
        var config = createHeaders($cookieStore);
        
        $http.get(buildUrl($location, '/history/' + $cookieStore.get('username') + '/' + $stateParams.otherUser), config).
        then(function(response) {
            $scope.messages = response.data;
        }, function(error) {
            alert('Error fetching history: ' + error.data);
        });
    }
    getHistory();

    webSocket.on('message/' + $stateParams.otherUser + '/' + $cookieStore.get('username'), function (data) {
        $scope.messages.push({origin: $stateParams.otherUser, value: data});
    });

    $scope.sendMessage = function () {
        $scope.typedMessage = $scope.typedMessage.trim();

        if ($scope.typedMessage.length > 0) {
            webSocket.emit('sendMessage', {
                origin: $cookieStore.get('username'),
                target: $stateParams.otherUser,
                value: $scope.typedMessage
            });

            $scope.messages.push({origin: $cookieStore.get('username'), value: $scope.typedMessage});
            $scope.typedMessage = '';
        }
    };
}

angular.module('privateChat').controller('private', PrivateChatController);