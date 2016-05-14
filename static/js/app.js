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

privateChatApp.directive('modal', function(){
        return {
            template: '<div class="modal fade bs-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm"><div class="modal-content" ng-transclude><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title" id="myModalLabel">Modal title</h4></div></div></div></div>',
            restrict: 'E',
            transclude: true,
            replace:true,
            scope:{visible:'='},
            link: function postLink (scope, element, attrs){
                $(element).modal({
                    show: false,
                    keyboard: attrs.keyboard,
                    backdrop: attrs.backdrop
                });

                scope.$watch(function(){return scope.visible;}, function(value){
                    if(value == true){
                        $(element).modal('show');
                    }else{
                        $(element).modal('hide');
                    }
                });
            }
        };
    }
);

privateChatApp.directive('modalBody', function(){
    return {
        template:'<div class="modal-body" ng-transclude></div>',
        replace:true,
        restrict: 'E',
        transclude: true
    };
});

privateChatApp.directive('modalFooter', function(){
    return {
        template:'<div class="modal-footer" ng-transclude></div>',
        replace:true,
        restrict: 'E',
        transclude: true
    };
});