/**
 * Created by Matheus Alves on 14/05/2016.
 */

'use strict';

var fnv = require('fnv-plus');

var logger = console;
var httpStatusCodes = require('../api/httpstatuscodes.js');

var UsersRepository = require('../repository/usersrepository.js').UsersRepository;
var usersRepository = new UsersRepository();

function fetchUser (username, callback) {
    return usersRepository.get(username, callback);
}

function fetchUsers (callback) {
    return usersRepository.getAll(callback);
}

function insertUser (userInfo, callback) {
    var passwordHash = fnv.hash(userInfo.password);
    
    return usersRepository.create(userInfo.username, passwordHash.dec(), callback);
}

function checkIfUsernameAvailable (username, callback) {
    usersRepository.get(username, function (error, user) {
        if (error) {
            logger.error('Error checking if username is available: %s', error);
            return callback(error, null);
        }

        if (user) {
            logger.info('Username %s already exists', username);
            return callback(null, false);
        }

        return callback(null, true);
    });
}

function registerUser (req, res, next) {
    logger.info('Received register user request');
    
    checkIfUsernameAvailable(req.body.username, function (error, available) {
        if (error) {
            return res.send(httpStatusCodes.InternalServerError, error);
        }

        if (!available) {
            var errorMessage = 'Username not available';
            logger.error(errorMessage);
            return res.send(httpStatusCodes.NotAcceptable, errorMessage);
        }

        insertUser(req.body, function (error) {
            if (error) {
                return res.send(httpStatusCodes.InternalServerError, error);
            }

            return res.send(httpStatusCodes.Created, '');
        });
    });
}

function authenticateUser (req, res, next) {
    logger.info('Received authenticate user request');

    fetchUser(req.body.username, function (error, result) {
        if (error) {
            return res.send(httpStatusCodes.InternalServerError, error);
        }

        if (result) {
            var passwordHash = fnv.hash(req.body.password);

            if (passwordHash.dec() === result.passwordHash) {
                logger.info('User %s successfully authenticated', result.name);
                return res.send(httpStatusCodes.OK, '');
            }
        }

        var errorMessage = 'Invalid username or password';
        logger.error(errorMessage);
        return res.send(httpStatusCodes.Unauthorized, errorMessage);
    });
}

function getUsers (req, res, next) {
    fetchUsers(function (error, results) {
        if (error) {
            return res.send(httpStatusCodes.InternalServerError, error);
        }

        var users = [];

        for (var item in results) {
            var user = results[item];
            
            if (user.name != req.params.user) {
                users.push(user.name);
            }
        }
        
        req.users = users;

        return next();
    });
}

module.exports = {
    registerUser: registerUser,
    getUsers: getUsers,
    authenticateUser: authenticateUser
};