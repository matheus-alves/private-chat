/**
 * Created by Matheus Alves on 02/06/2016.
 */

'use strict';

var dbConnection = require('../database/dbconnection.js');

var logger = console;

function getUser (username, callback) {
    dbConnection.getConnection().get('SELECT * FROM Users WHERE name = ?', username, function (error, row) {
        if (error) {
            logger.error('Error fetching user: %s', error);
            return callback(error, null);
        }

        return callback(null, row);
    });
}

function getAllUsers (callback) {
    dbConnection.getConnection().all('SELECT * FROM Users', function (error, rows) {
        if (error) {
            logger.error('Error fetching users: %s', error);
            return callback(error, null);
        }

        return callback(null, rows);
    });
}

function insertUser (username, password, callback) {
    var data = [
        username,
        password
    ];
    
    dbConnection.getConnection().run('INSERT INTO Users (name, passwordHash) VALUES (?, ?)', data, function (error, row) {
        if (error) {
            logger.error('Error inserting user: %s', error);
            return callback(error);
        }

        logger.info('User %s created', username);

        return callback(null);
    });
}

function UsersRepository() {
    this.get = getUser;
    this.getAll = getAllUsers;
    this.create = insertUser;
}

module.exports = {
    UsersRepository: UsersRepository
};