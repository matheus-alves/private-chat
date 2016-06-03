/**
 * Created by Matheus Alves on 14/05/2016.
 */

'use strict';

var sqlite3 = require("sqlite3").verbose();
var fs = require('fs');
var logger = console;

var dbFile = './database/privatechat.db';

var db;

// Constants
var CREATE_USERS_TABLE = "CREATE TABLE 'Users' ('id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,'name' TEXT NOT NULL UNIQUE,'passwordHash' TEXT NOT NULL)";
var CREATE_MESSAGES_TABLE = "CREATE TABLE 'Messages' ('id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,'origin' TEXT NOT NULL,'target' TEXT NOT NULL,'message' INTEGER)";

function setupDbConnection (callback) {
    var fileExists = fs.existsSync(dbFile);
    if(!fileExists) {
        fs.openSync(dbFile, "w");
    }

    db = new sqlite3.Database(dbFile);

    db.serialize(function() {
        if(!fileExists) {
            logger.info('Creating local database');
            db.run(CREATE_USERS_TABLE);
            db.run(CREATE_MESSAGES_TABLE);
        }

        callback(null);
    });
}

module.exports = {
    setupDbConnection: setupDbConnection,
    getConnection: function () {
        return db;
    }
};