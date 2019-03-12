//express is the framework we're going to use to handle requests 
const express = require('express');
//Create connection to Heroku Database
let db = require('../utilities/utils').db;
var router = express.Router();
const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());
let msg_functions = require('../utilities/utils').messaging;
//send a message to all users "in" the chat session with chatId
router.post("/send", (req, res) => {
    let username = req.body['username'];
    let message = req.body['message'];
    let chatId = req.body['chatId'];
    let memberid = req.body['memberid'];
    if(!username || !message || !chatId) {
        res.send({
            success: false,
            error: "username, message, or chatId not supplied"
        });
    return; }
    //add the message to the database
    let insert = `INSERT INTO Messages(ChatId, Message, MemberId)
                  SELECT $1, $2, MemberId FROM Members
                  WHERE username=$3`
    db.none(insert, [chatId, message, username])
    .then(() => {
        //send a notification of this message to ALL members with registered tokens
        db.manyOrNone('SELECT * FROM Push_Token')
        .then(rows => {
            rows.forEach(element => {
                msg_functions.sendToIndividual(element['token'], message, username, chatId);
            });
                db.none('UPDATE conversationmembers SET unread = 0 where chatid = $1 AND memberid != $2',[chatId], memberid )
                .then(() => {
                    res.send({
                        success: true
                    });
                }).catch(err => {
                    res.send({
                        success: false,
                        error: err,
                    });
                })
        }).catch(err => {
            res.send({
                success: false,
                error: err,
            });
        })
    }).catch((err) => {
        res.send({
            success: false,
            error: err,
        });
}); });
//Get all of the messages from a chat session with id chatid
router.post("/getAll", (req, res) => {
    let chatId = req.body['chatId'];
          
let query = `SELECT Members.Email, Messages.Message,
             to_char(Messages.Timestamp AT TIME ZONE 'PDT', 'YYYY-MM-DD HH24:MI:SS.US' ) AS Timestamp,
             Members.username
             FROM Messages
             INNER JOIN Members ON Messages.MemberId=Members.MemberId
             WHERE ChatId=$1
             ORDER BY Timestamp DESC`
db.manyOrNone(query, [chatId])
.then((rows) => {
    res.send({
        messages: rows
    })
}).catch((err) => {
    res.send({
        success: false,
error: err })
}); });

router.post("/read", (req, res) => {
    let chatId = req.body['chatid'];
    let memberid = req.body['memberid'];
          
db.none('UPDATE conversationmembers SET unread = -1 where chatid = $1 AND memberid = $2',[chatId, memberid] )
.then(() => {
    res.send({
        success: true
    });
}).catch(err => {
    res.send({
        success: false,
        error: err,
    });
}) });
module.exports = router;