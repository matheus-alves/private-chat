/**
 * Created by Matheus Alves on 10/05/2015.
 */

'use strict';

var restify = require('restify');

var logger = console;
var httpStatusCodes = require('./api/httpstatuscodes.js');
var dbConnection = require('./database/dbConnection.js');

// Constants
var DEFAULT_HTTP_PORT = 8080;

// Server creation
var server = restify.createServer({
    name: 'private-chat'
});
server.use(restify.fullResponse());
server.use(restify.queryParser());
server.use(restify.bodyParser({mapParams: true}));

// Controllers
var controllersPath = './controllers/';
var controllers = {
    users: require(controllersPath + 'users.js')
};

// Server configuration
server.pre(restify.sanitizePath());
server.pre(function (req, res, next) {
    req.dbConnection = dbConnection.getConnection();
    return next();
});

// Requests configuration
server.get('/', restify.serveStatic({
    directory: './static',
    file: 'index.html'
}));

server.get(/\/?.*/, restify.serveStatic({
    directory: './static'
}));

server.post('/register', controllers.users.registerUser);

function setupServer (callback) {
    dbConnection.setupDbConnection(callback);
}

function logError (error) {
    logger.info('Error starting %s server', server.name);
    logger.error(error);
}

function startServer () {
    try {
        // Server startup
        var port = process.argv[2] || DEFAULT_HTTP_PORT;

        if (isNaN(port) || port < 0) {
            throw new Error('Port should be a valid positive number');
        }

        server.listen(port, function (error) {
            if (error) {
                logError(error);
            } else {
                logger.info('%s server listening on port: %d', server.name, port);
            }
        });

        // Exception handling
        server.on('uncaughtException', function (req, res, route, error) {
            logger.error(error);
            res.send(httpStatusCodes.InternalServerError, 'Uncaught Exception: ' + error);
        });

        server.on('error', function (error) {
            logError(error);
        });
    } catch (error) {
        logError(error);
    }
}

setupServer(function (error) {
    if (error) {
        logError(error);
    } else {
        startServer();
    }
});