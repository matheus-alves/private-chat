/**
 * Created by Matheus Alves on 15/05/2016.
 */

'use strict';

var logger = console;
var httpStatusCodes = require('../api/httpstatuscodes.js');

var unreadMessagesMap = {};

function getUnreadMesagesCount (req, res, next) {
    var users = req.users;
    
    var response = {};

    if (!unreadMessagesMap[req.params.user]) {
        unreadMessagesMap[req.params.user] = {};
    }
    
    for (var item in users) {
        response[users[item]] = 
            unreadMessagesMap[req.params.user][users[item]] ? unreadMessagesMap[req.params.user][users[item]] : 0;
    }
    
    return res.send(httpStatusCodes.OK, response);
}

function addNewMessage (message) {
    // TODO save on db
    
    if (!unreadMessagesMap[message.target]) {
        unreadMessagesMap[message.target] = {};
    }

    if (!unreadMessagesMap[message.target][message.origin]) {
        unreadMessagesMap[message.target][message.origin] = 0;
    }

    unreadMessagesMap[message.target][message.origin]++;
}

module.exports = {
    addNewMessage: addNewMessage,
    getUnreadMessagesCount: getUnreadMesagesCount
};