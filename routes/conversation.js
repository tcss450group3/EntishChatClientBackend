//express is the framework we're going to use to handle requests 
const express = require('express');
//Create connection to Heroku Database
let db = require('../utilities/utils').db;
var router = express.Router();
const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());
// let msg_functions = require('../utilities/utils').messaging;
//send a message to all users "in" the chat session with chatId

//Get all of the messages from a chat session with id chatid
router.post("/", (req, res) => {
    let email = req.body['email'];

    let query = `SELECT conversations.chatid, conversations.name
             FROM conversations, conversationmembers, members
             WHERE conversations.chatid = conversationmembers.chatid AND conversationmembers.memberid = members.memberid AND
             email = $1`
    db.manyOrNone(query, [email])
    .then((data) => {
        res.send({
            conversation: data
        });
    }).catch((error) => {
        console.log(error);
        res.send({
success: false,
            error: error
        })
}); });
module.exports = router;