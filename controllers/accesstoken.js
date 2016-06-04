/**
 * Created by Matheus Alves on 02/06/2016.
 */

var jwt = require('jsonwebtoken');

var logger = console;
var httpStatusCodes = require('../api/httpstatuscodes.js');

// Constants
var secret = 'private-chat-secret';

function validateAccessToken (req, res, next) {
    var token = req.headers['authorization'] ;

    if (token) {
        jwt.verify(token, secret, function(error, decoded) {
            if (error) {
                return res.send(httpStatusCodes.Forbidden, error);
            }
            
            return next();
        });
    } else {
        var errorMessage = 'Missing access token';
        logger.error(errorMessage);
        return res.send(httpStatusCodes.Forbidden, errorMessage);
    }
}

function generateAccessToken (username, password) {
    logger.info('Generating access token for user %s', username);

    var accessToken = jwt.sign(username + password, secret);

    return accessToken;
}

module.exports = {
    generateAccessToken: generateAccessToken,
    validateAccessToken: validateAccessToken
};