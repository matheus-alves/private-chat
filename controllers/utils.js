/**
 * Created by Matheus Alves on 15/05/2016.
 */

'use strict';

var logger = console;
var httpStatusCodes = require('../api/httpstatuscodes.js');

function validateDbConnection (req, res) {
    if (!req.dbConnection) {
        var errorMessage = 'Lost database connection';
        logger.error(errorMessage);
        return res.send(httpStatusCodes.InternalServerError, errorMessage);
    }
}

function validateBody (req, res) {
    if (!req.body) {
        var errorMessage = 'Missing mandatory body';
        logger.error(errorMessage);
        return res.send(httpStatusCodes.BadRequest, errorMessage);
    }
}

function sendDatabaseErrorResponse (res) {
    var errorMessage = 'Database error';
    logger.error(errorMessage);
    return res.send(httpStatusCodes.InternalServerError, errorMessage);
}

module.exports = {
    validateDbConnection: validateDbConnection,
    validateBody: validateBody,
    sendDatabaseErrorResponse: sendDatabaseErrorResponse
};