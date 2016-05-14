/**
 * Created by Matheus Alves on 14/05/2016.
 */

'use strict';

function PrivateChatController ($scope, $stateParams) {
    // TODO retrieve messages from server
    $scope.messages = [];

    $scope.sendMessage = function () {
        $scope.typedMessage = $scope.typedMessage.trim();

        if ($scope.typedMessage.length > 0) {
            // TODO server communication
            $scope.messages.push({origin: $stateParams.username, value: $scope.typedMessage});
            $scope.typedMessage = '';
        }
    };
}

angular.module('privateChat').controller('private', PrivateChatController);