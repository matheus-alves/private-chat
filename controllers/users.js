/**
 * Created by Matheus Alves on 14/05/2016.
 */

'use strict';

var fnv = require('fnv-plus');

var logger = console;
var httpStatusCodes = require('../api/httpstatuscodes.js');

function insertUser (dbConnection, userInfo, callback) {
    var passwordHash = fnv.hash(userInfo.password);

    var data = [
        userInfo.username,
        passwordHash.dec()
    ];

    dbConnection.run('INSERT INTO Users (name, passwordHash) VALUES (?, ?)', data, function (error, row) {
        if (error) {
            logger.error('Error inserting user: %s', error);
            return callback(error);
        }

        logger.info('User %s created', userInfo.username);

        return callback(null);
    });
}

function checkIfUsernameAvailable (dbConnection, username, callback) {
    dbConnection.get('SELECT * FROM Users WHERE name = ?', username, function (error, row) {
        if (error) {
            logger.error('Error checking if username is available: %s', error);
            return callback(error, null);
        }

        if (row) {
            logger.info('Username %s already exists', username);
            return callback(null, false);
        }

        return callback(null, true);
    });
}

function validateDbConnection (req, res) {
    if (!req.dbConnection) {
        var errorMessage = 'Lost database connection';
        logger.error(errorMessage);
        return res.send(httpStatusCodes.InternalServerError, errorMessage);
    }
}

function sendDatabaseErrorResponse (res) {
    var errorMessage = 'Database error';
    logger.error(errorMessage);
    return res.send(httpStatusCodes.InternalServerError, errorMessage);
}

function registerUser (req, res, next) {
    validateDbConnection(req, res);

    logger.info('Received register user request');

    if (!req.body) {
        var errorMessage = 'Missing mandatory body';
        logger.error(errorMessage);
        return res.send(httpStatusCodes.BadRequest, errorMessage);
    }
    
    checkIfUsernameAvailable(req.dbConnection, req.body.username, function (error, available) {
        if (error) {
            return sendDatabaseErrorResponse(res);
        }

        if (!available) {
            var errorMessage = 'Username not available';
            logger.error(errorMessage);
            return res.send(httpStatusCodes.NotAcceptable, errorMessage);
        }

        insertUser(req.dbConnection, req.body, function (error) {
            if (error) {
                return sendDatabaseErrorResponse(res);
            }

            return res.send(httpStatusCodes.Created, '');
        });
    });
}

function fetchUsers (dbConnection, callback) {
    dbConnection.all('SELECT * FROM Users', function (error, rows) {
        if (error) {
            logger.error('Error fetching users: %s', error);
            return callback(error, null);
        }

        return callback(null, rows);
    });
}

function getUsers (req, res, next) {
    validateDbConnection(req, res);

    fetchUsers(req.dbConnection, function (error, results) {
        if (error) {
            return sendDatabaseErrorResponse(res);
        }

        var response = {};

        for (var item in results) {
            var user = results[item];

            response[user.name] = 0; // number of messages will be fetched later
        }

        return res.send(httpStatusCodes.OK, response);
    });
}

module.exports = {
    registerUser: registerUser,
    getUsers: getUsers
};