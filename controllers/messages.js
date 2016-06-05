/**
 * Created by Matheus Alves on 15/05/2016.
 */

'use strict';

var Q = require('q');

var logger = console;
var httpStatusCodes = require('../api/httpstatuscodes.js');

var UsersRepository = require('../repository/usersrepository.js').UsersRepository;
var usersRepository = new UsersRepository();

var MessagesRepository = require('../repository/messagesrepository.js').MessagesRepository;
var messagesRepository = new MessagesRepository();

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

function insertMessage (message, callback) {
    return messagesRepository.add(message.origin, message.target, message.value, callback);
}

function addNewMessage (message) {
    insertMessage(message, function (error) {
        if (error) {
            return logger.error('Error storing message');
        }

        increaseUnreadMessagesCount(message.target, message.origin);
        clearUnreadMessagesCount(message.origin, message.target);
    });
}

function retrieveMessages (user, otherUser, callback) {
    logger.info('Retrieving messages for users %s and %s', user, otherUser);
    return messagesRepository.getBetweenUsers(user, otherUser, callback);
}

function handleMessageRetrieval (user, otherUser, res) {
    retrieveMessages(user, otherUser, function (error, messages) {
        if (error) {
            return res.send(httpStatusCodes.InternalServerError, error);
        }

        var response = [];

        messages.forEach( function (message) {
            var messageItem = {};

            messageItem.origin = message.origin;
            messageItem.value = message.message;

            response.push(messageItem);
        });

        clearUnreadMessagesCount(user, otherUser);

        return res.send(httpStatusCodes.OK, response);
    });
}

function handleUserFetch (username) {
    var deferred = Q.defer();
    usersRepository.get(username, deferred.makeNodeResolver());
    return deferred.promise;
}

function getHistory (req, res, next) {
    logger.info('Received get history request');

    var user = req.params.user;
    var otherUser = req.params.otherUser;

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
                return res.send(httpStatusCodes.InternalServerError, result.reason);
            }
        }

        handleMessageRetrieval(user, otherUser, res);
    });
}

module.exports = {
    addNewMessage: addNewMessage,
    getUnreadMessagesCount: getUnreadMessagesCount,
    getHistory: getHistory
};