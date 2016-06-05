/**
 * Created by Matheus Alves on 31/05/2016.
 */

'use strict';

var sqlite3 = require("sqlite3").verbose();

// Constants
var CREATE_USERS_TABLE = "CREATE TABLE 'Users' ('id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,'name' TEXT NOT NULL UNIQUE,'passwordHash' TEXT NOT NULL)";
var CREATE_MESSAGES_TABLE = "CREATE TABLE 'Messages' ('id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,'origin' TEXT NOT NULL,'target' TEXT NOT NULL,'message' INTEGER)";

var db;

function createDbConnection (callback) {
    db = new sqlite3.Database(':memory:');

    db.serialize(function() {
        db.run(CREATE_USERS_TABLE);
        db.run(CREATE_MESSAGES_TABLE);

        callback(null);
    });
}

module.exports = {
    createDbConnection: createDbConnection,
    getMock: function () {
        return {
            getConnection: function () {
                return db;
            }
        }
    }
};