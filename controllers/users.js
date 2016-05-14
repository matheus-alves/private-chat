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

function registerUser (req, res, next) {
    if (!req.dbConnection) {
        var errorMessage = 'Lost database connection';
        logger.error(errorMessage);
        return res.send(httpStatusCodes.InternalServerError, errorMessage);
    }

    logger.info('Received register user request');

    if (!req.body) {
        var errorMessage = 'Missing mandatory body';
        logger.error(errorMessage);
        return res.send(httpStatusCodes.BadRequest, errorMessage);
    }
    
    checkIfUsernameAvailable(req.dbConnection, req.body.username, function (error, available) {
        if (error) {
            var errorMessage = 'Database error';
            logger.error(errorMessage);
            return res.send(httpStatusCodes.InternalServerError, errorMessage);
        }

        if (!available) {
            var errorMessage = 'Username not available';
            logger.error(errorMessage);
            return res.send(httpStatusCodes.NotAcceptable, errorMessage);
        }

        insertUser(req.dbConnection, req.body, function (error) {
            if (error) {
                var errorMessage = 'Database error';
                logger.error(errorMessage);
                return res.send(httpStatusCodes.InternalServerError, errorMessage);
            }

            return res.send(httpStatusCodes.Created, '');
        });
    });
}

module.exports = {
    registerUser: registerUser
};