/**
 * Created by Matheus Alves on 11/05/2016.
 */

'use strict';

var privateChatApp = angular.module('privateChat', []);

// TODO remove these hardcoded sample values
var users = {
    userA: 2,
    userB: 3
};

function UsersController ($scope) {
    $scope.users = users;
    $scope.selectUser = function (user) {
        var element = angular.element( document.querySelector( '#chatArea' ) );
        element.html(user);
    }
}

privateChatApp.controller('users', UsersController);