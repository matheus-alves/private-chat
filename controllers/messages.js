/**
 * Created by Matheus Alves on 15/05/2016.
 */

'use strict';

var Q = require('q');

var logger = console;
var httpStatusCodes = require('../api/httpstatuscodes.js');
var utils = require('./utils');
var users = require('./users');

var unreadMessagesMap = {};

function increaseUnreadMessagesCount (origin, target) {
    if (!unreadMessagesMap[origin]) {
        unreadMessagesMap[origin] = {};
    }

    if (!unreadMessagesMap[origin][target]) {
        unreadMessagesMap[origin][target] = 0;
    }

    unreadMessagesMap[origin][target]++;
}

function clearUnreadMessagesCount (origin, target) {
    if (unreadMessagesMap[origin]) {
        if (unreadMessagesMap[origin][target]) {
            unreadMessagesMap[origin][target] = 0;
        }
    }
}

function getUnreadMessagesCount (req, res, next) {
    var users = req.users;
    var otherUser = req.query.otherUser;
    
    var response = {};

    if (!unreadMessagesMap[req.params.user]) {
        unreadMessagesMap[req.params.user] = {};
    }

    if (otherUser) {
        // auto-read current chat messages
        unreadMessagesMap[req.params.user][otherUser] = 0;
    }
    
    for (var item in users) {
        response[users[item]] = 
            unreadMessagesMap[req.params.user][users[item]] ? unreadMessagesMap[req.params.user][users[item]] : 0;
    }
    
    return res.send(httpStatusCodes.OK, response);
}

function insertMessage (origin, target, value, dbConnection, callback) {
    var data = [
        origin,
        target,
        value
    ];

    dbConnection.run('INSERT INTO Messages (origin, target, message) VALUES (?, ?, ?)', data, function (error, row) {
        if (error) {
            logger.error('Error inserting message: %s', error);
            return callback(error);
        }

        return callback(null);
    });
}

function addNewMessage (message, dbConnection) {
    if (!dbConnection) {
        logger.error('Missing database connection');
        return;
    }

    insertMessage(message.origin, message.target, message.value, dbConnection, function (error) {
        if (error) {
            logger.error('Error storing message');
            return;
        }

        increaseUnreadMessagesCount(message.target, message.origin);
        clearUnreadMessagesCount(message.origin, message.target);
    });
}

function retrieveMessages (user, otherUser, dbConnection, callback) {
    logger.info('Retrieving messages for users %s and %s', user, otherUser);

    var data = [
        user,
        otherUser,
        user,
        otherUser
    ];

    dbConnection.all('SELECT * FROM Messages WHERE (origin = ? AND target = ?) OR (target = ? AND origin = ?)', data,
        function (error, rows) {
        if (error) {
            logger.error('Error fetching messages: %s', error);
            return callback(error, null);
        }

        return callback(null, rows);
    });
}

function getHistory (req, res, next) {
    utils.validateDbConnection(req, res);

    logger.info('Received get history request');

    var user = req.params.user;
    var otherUser = req.params.otherUser;

    function handleUserFetch (username) {
        var deferred = Q.defer();
        users.fetchUser(req.dbConnection, username, deferred.makeNodeResolver());
        return deferred.promise;
    }

    var promises = [];
    promises.push(handleUserFetch(user));
    promises.push(handleUserFetch(otherUser));

    Q.allSettled(promises).then( function (results) {
        for (var item in results) {
            var result = results[item];

            if (result.state === "fulfilled") {
                var value = result.value;

                if (!value) {
                    var errorMessage = 'Invalid username';
                    logger.error(errorMessage);
                    return res.send(httpStatusCodes.Unauthorized, errorMessage);
                }
            } else {
                return utils.sendDatabaseErrorResponse(res);
            }
        }

        retrieveMessages(user, otherUser, req.dbConnection, function (error, messages) {
            if (error) {
                return utils.sendDatabaseErrorResponse(res);
            }

            var response = [];

            for (var item in messages) {
                var messageItem = {};

                var message = messages[item];
                messageItem.origin = message.origin;
                messageItem.value = message.message;

                response.push(messageItem);
            }

            clearUnreadMessagesCount(user, otherUser);

            return res.send(httpStatusCodes.OK, response);
        });
    });
}

module.exports = {
    addNewMessage: addNewMessage,
    getUnreadMessagesCount: getUnreadMessagesCount,
    getHistory: getHistory
};