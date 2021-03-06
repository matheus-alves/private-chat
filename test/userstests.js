/**
 * Created by Matheus Alves on 01/06/2016.
 */

'use strict';

var test = require('tape');
var httpMocks = require('node-mocks-http');
var eventEmitter = require('events').EventEmitter;

var mockDbConnection = require('./test_utils/mockdbconnection.js');
var mockery = require('mockery');
mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false
});
mockery.registerMock('../database/dbconnection.js', mockDbConnection.getMock());

var users = require('../controllers/users.js');
var httpStatusCodes = require('../api/httpstatuscodes.js');

function runTests () {
    test('registerUser - OK', function (t) {
        t.plan(1);

        mockDbConnection.createDbConnection(function () {
            var req = httpMocks.createRequest();
            req.body = {
                username: 'a',
                password: 'test'
            };

            var res = httpMocks.createResponse({eventEmitter: eventEmitter});

            users.registerUser(req, res);

            res.on('send', function () {
                t.equal(res.statusCode, httpStatusCodes.Created);
            });
        });
    });

    test('registerUser - Existing user', function (t) {
        t.plan(1);

        var req = httpMocks.createRequest();
        req.body = {
            username: 'a',
            password: 'test'
        };

        var res = httpMocks.createResponse({eventEmitter: eventEmitter});

        users.registerUser(req, res);

        res.on('send', function () {
            t.equal(res.statusCode, httpStatusCodes.NotAcceptable);
        });
    });

    test('registerUser - Missing username', function (t) {
        t.plan(1);

        var req = httpMocks.createRequest();
        req.body = {
            password: 'test'
        };

        var res = httpMocks.createResponse({eventEmitter: eventEmitter});

        users.registerUser(req, res);

        res.on('send', function () {
            t.equal(res.statusCode, httpStatusCodes.InternalServerError);
        });
    });

    test('getUsers - OK', function (t) {
        t.plan(2);

        var req = httpMocks.createRequest();
        var res = httpMocks.createResponse();

        users.getUsers(req, res, function () {
            var userList = req.users;

            t.equal(userList.length, 1);
            t.equal(userList[0], 'a');
        });
    });

    test('getUsers - Add another user', function (t) {
        t.plan(4);

        var req = httpMocks.createRequest();
        req.body = {
            username: 'b',
            password: 'test'
        };

        var res = httpMocks.createResponse({eventEmitter: eventEmitter});

        users.registerUser(req, res);

        res.on('send', function () {
            t.equal(res.statusCode, httpStatusCodes.Created);

            var req2 = httpMocks.createRequest();
            var res2 = httpMocks.createResponse();

            users.getUsers(req2, res2, function () {
                var userList = req2.users;

                t.equal(userList.length, 2);
                t.equal(userList[0], 'a');
                t.equal(userList[1], 'b');
            });
        });
    });

    test('authenticateUser - OK', function (t) {
        t.plan(1);

        var req = httpMocks.createRequest();
        req.body = {
            username: 'a',
            password: 'test'
        };

        var res = httpMocks.createResponse({eventEmitter: eventEmitter});

        users.authenticateUser(req, res);

        res.on('send', function () {
            t.equal(res.statusCode, httpStatusCodes.OK);
        });
    });

    test('authenticateUser - Invalid Username', function (t) {
        t.plan(1);

        var req = httpMocks.createRequest();
        req.body = {
            username: '',
            password: 'test'
        };

        var res = httpMocks.createResponse({eventEmitter: eventEmitter});

        users.authenticateUser(req, res);

        res.on('send', function () {
            t.equal(res.statusCode, httpStatusCodes.Unauthorized);
        });
    });

    test('authenticateUser - Invalid Password', function (t) {
        t.plan(1);

        var req = httpMocks.createRequest();
        req.body = {
            username: 'a',
            password: ''
        };

        var res = httpMocks.createResponse({eventEmitter: eventEmitter});

        users.authenticateUser(req, res);

        res.on('send', function () {
            t.equal(res.statusCode, httpStatusCodes.Unauthorized);
        });
    });
}

runTests();