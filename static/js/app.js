/**
 * Created by Matheus Alves on 11/05/2016.
 */

'use strict';

var privateChatApp = angular.module('privateChat', ['ui.router']);

privateChatApp.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/login');

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'pages/login.html'
    }).state('chat', {
        url: '/chat',
        params: {
            username: null
        },
        templateUrl: 'pages/chat.html',
        controller: function($stateParams){
            console.log($stateParams.username);
        }
    });
});

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