/**
 * Created by Matheus Alves on 14/05/2016.
 */

// TODO remove these hardcoded sample values
var users = {
    userA: 2,
    userB: 3
};

function UsersController ($scope, $state) {
    $scope.users = users;
    
    $scope.selectUser = function (selectedUser) {
        // TODO server communication
        $state.go('chat.private', {otherUser: selectedUser});
    }
}

angular.module('privateChat').controller('users', UsersController);
