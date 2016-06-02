/**
 * Created by Matheus Alves on 31/05/2016.
 */

'use strict';

var test = require('tape');
var httpMocks = require('node-mocks-http');
var eventEmitter = require('events').EventEmitter;

var logger = console;

var messages = require('../controllers/messages.js');
var users = require('../controllers/users.js');
var httpStatusCodes = require('../api/httpstatuscodes.js');

var mockDbConnectionCreator = require('./test_utils/mockdbconnection.js');
var mockDbConnection;

function createMockMessage (origin, target, value) {
    return {
        origin: origin,
        target: target,
        value: value
    };
}

function createUsers (callback) {
    var req = httpMocks.createRequest();

    req.dbConnection = mockDbConnection;
    req.body = {
        username: 'a',
        password: 'test'
    };

    var res = httpMocks.createResponse({eventEmitter: eventEmitter});

    users.registerUser(req, res);

    var registerCount = 0;
    res.on('send', function() {
        registerCount++;

        if (registerCount == 2) {
            return callback();
        } else {
            req.body = {
                username: 'b',
                password: 'test'
            };

            users.registerUser(req, res);
        }
    });
}

function setUp() {
    mockDbConnectionCreator.createDbConnection(function (dbConnection) {
        if (!dbConnection) {
            return logger.info('Error setting messages tests up');
        }

        mockDbConnection = dbConnection;

        createUsers(function () {
            messages.addNewMessage(createMockMessage('a', 'b', 'test'), mockDbConnection);

            runTests();
        });
    });
}

setUp();

function runTests () {
    test('getHistory - OK', function (t) {
        t.plan(4);

        var req = httpMocks.createRequest();

        req.dbConnection = mockDbConnection;
        req.params.user = 'a';
        req.params.otherUser = 'b';

        var res = httpMocks.createResponse({eventEmitter: eventEmitter});

        messages.getHistory(req, res);

        res.on('send', function() {
            var history = res._getData();

            t.equal(res.statusCode, httpStatusCodes.OK);
            t.equal(history.length, 1);
            t.equal(history[0].origin, 'a');
            t.equal(history[0].value, 'test');
        });
    });

    test('getHistory - Invalid Username', function (t) {
        t.plan(1);

        var req = httpMocks.createRequest();
        req.dbConnection = mockDbConnection;
        req.params.user = 'c';
        req.params.otherUser = 'b';

        var res = httpMocks.createResponse({eventEmitter: eventEmitter});

        messages.getHistory(req, res);

        res.on('send', function() {
            t.equal(res.statusCode, httpStatusCodes.Unauthorized);
        });
    });

    test('getHistory - Missing Username', function (t) {
        t.plan(1);

        var req = httpMocks.createRequest();
        req.dbConnection = mockDbConnection;

        var res = httpMocks.createResponse({eventEmitter: eventEmitter});

        messages.getHistory(req, res);

        res.on('send', function() {
            t.equal(res.statusCode, httpStatusCodes.Unauthorized);
        });
    });

    test('getUnreadMessagesCount - OK With Unread Messages', function (t) {
        t.plan(2);

        var req = httpMocks.createRequest();

        req.params.user = 'b';
        req.users = ['a'];

        var res = httpMocks.createResponse();

        messages.getUnreadMessagesCount(req, res);

        var unreadMessagesCount = res._getData();

        t.equal(res.statusCode, httpStatusCodes.OK);
        t.equal(unreadMessagesCount['a'], 1)
    });

    test('getUnreadMessagesCount - OK Without Unread Messages', function (t) {
        t.plan(2);

        var req = httpMocks.createRequest();

        req.params.user = 'a';
        req.users = ['b'];

        var res = httpMocks.createResponse();

        messages.getUnreadMessagesCount(req, res);

        var unreadMessagesCount = res._getData();

        t.equal(res.statusCode, httpStatusCodes.OK);
        t.equal(unreadMessagesCount['b'], 0)
    });

    test('getUnreadMessagesCount - OK Clearing Unread Messages', function (t) {
        t.plan(2);

        var req = httpMocks.createRequest();

        req.params.user = 'b';
        req.users = ['a'];
        req.query = {
            otherUser: 'a'
        };

        var res = httpMocks.createResponse();

        messages.getUnreadMessagesCount(req, res);

        var unreadMessagesCount = res._getData();

        t.equal(res.statusCode, httpStatusCodes.OK);
        t.equal(unreadMessagesCount['a'], 0)
    });

    test('getUnreadMessagesCount - OK With No Users', function (t) {
        t.plan(2);

        var req = httpMocks.createRequest();

        var res = httpMocks.createResponse();

        messages.getUnreadMessagesCount(req, res);

        var unreadMessagesCount = res._getData();

        t.equal(res.statusCode, httpStatusCodes.OK);
        t.deepEqual(unreadMessagesCount, {});
    });
}