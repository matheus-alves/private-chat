/**
 * Created by Matheus Alves on 02/06/2016.
 */

var test = require('tape');
var httpMocks = require('node-mocks-http');
var eventEmitter = require('events').EventEmitter;

var jwt = require('jsonwebtoken');

var accessToken = require('../controllers/accesstoken.js');
var httpStatusCodes = require('../api/httpstatuscodes.js');

function runTests () {
    test('validateAccessToken - OK', function (t) {
        t.plan(1);

        var req = httpMocks.createRequest();
        req.headers['authorization'] = jwt.sign('username + password', 'private-chat-secret');

        var res = httpMocks.createResponse();

        accessToken.validateAccessToken(req, res, function () {
            t.pass(); // Validation passed
        });
    });

    test('validateAccessToken - Missing token', function (t) {
        t.plan(1);

        var req = httpMocks.createRequest();
        var res = httpMocks.createResponse();

        accessToken.validateAccessToken(req, res);

        t.equal(res.statusCode, httpStatusCodes.Forbidden);
    });

    test('validateAccessToken - Invalid token', function (t) {
        t.plan(1);

        var req = httpMocks.createRequest();
        req.headers['authorization'] = 'test';

        var res = httpMocks.createResponse({eventEmitter: eventEmitter});

        accessToken.validateAccessToken(req, res);

        res.on('send', function () {
            t.equal(res.statusCode, httpStatusCodes.Forbidden);
        });
    });
}

runTests();