/**
 * Created by Matheus Alves on 02/06/2016.
 */

'use strict';

var dbConnection = require('../database/dbconnection.js');

var logger = console;

function getMessagesBetweenUsers (user1, user2, callback) {
    var data = [
        user1,
        user2,
        user1,
        user2
    ];
    
    dbConnection.getConnection()
        .all('SELECT * FROM Messages WHERE (origin = ? AND target = ?) OR (target = ? AND origin = ?)', data,
        function (error, rows) {
            if (error) {
                logger.error('Error fetching messages: %s', error);
                return callback(error, null);
            }

            return callback(null, rows);
        });
}

function insertMessage (origin, target, message, callback) {
    var data = [
        origin,
        target,
        message
    ];

    dbConnection.getConnection().run('INSERT INTO Messages (origin, target, message) VALUES (?, ?, ?)', data, function (error, row) {
        if (error) {
            logger.error('Error inserting message: %s', error);
            return callback(error);
        }

        return callback(null);
    });
}

function MessagesRepository() {
    this.getBetweenUsers = getMessagesBetweenUsers;
    this.add = insertMessage;
}

module.exports = {
    MessagesRepository: MessagesRepository
};