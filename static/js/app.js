/**
 * Created by Matheus Alves on 11/05/2016.
 */

'use strict';

var privateChatApp = angular.module('privateChat', ['ui.router', 'luegg.directives']);

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
        },
        resolve: {
            username: ['$stateParams', function ($stateParams) {
                return $stateParams.username;
            }]
        }
    }).state('chat.private', {
        url: '/:otherUser',
        templateUrl: 'pages/private.html',
        controller: function($stateParams, username){
            console.log('Starting private chat');
            console.log(username);
            console.log($stateParams.otherUser);
        }
    });
});
