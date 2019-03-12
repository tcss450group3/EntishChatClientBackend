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

    let query = `SELECT conversations.chatid, conversations.name,                   conversationmembers.verified, conversationmembers.unread
             FROM conversations, conversationmembers, members
             WHERE conversations.chatid = conversationmembers.chatid AND conversationmembers.memberid = members.memberid AND
             email = $1
             ORDER BY conversationmembers.verified+0, conversationmembers.unread+0 DESC`
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


router.post("/new", (req, res) => {

    let name = req.body['name'];

    let query = `SELECT * FROM CONVERSATIONS WHERE NAME=$1;`
    db.manyOrNone(query, [name])
    //If successful, run function passed into .then()
    .then((data) => {
        if(data[0] == null) {
            // do something when chat room is not existed

            let query2 = `INSERT INTO CONVERSATIONS(NAME) VALUES($1);
            `
            db.manyOrNone(query2, [name]);
            let names = name.split(", ");

            let query3 = `SELECT * FROM CONVERSATIONS WHERE NAME=$1;`
            db.manyOrNone(query3, [name])
            .then((data) => {
                
                var chatid = data[0]['chatid'];

                for(var i =0; i<names.length; i++) {

                    let query4 = `SELECT MEMBERID FROM MEMBERS WHERE USERNAME = $1;`
                    db.manyOrNone(query4, [names[i]])
                    .then((data) => {
                        let query5 = `INSERT INTO CONVERSATIONMEMBERS(CHATID, MEMBERID) VALUES($1, $2)`
                        db.manyOrNone(query5, [chatid, data[0]['memberid']])
                    })
                }

                res.send({
                    conversation: data
                });
            }).catch((error) => {
                console.log(error);
                res.send({
                success: false,
                    error: "fail to select from conversation 2"
                })
            });
        } else {
            // do something when chat room is existed
            res.send({
                conversation: data
            });
        }
        
    }).catch((error) => {
        console.log(error);
        res.send({
        success: false,
            error: "fail to select from conversation 1"
        })
    });
 });


 router.post("/accept", (req, res) => {

    let chatid = req.body['chatid'];
    let memberid = req.body['memberid'];
    
    db.manyOrNone('UPDATE conversationmembers SET verified = -1 WHERE chatid = $1 AND memberid = $2', [chatid, memberid])
    .then(() => {
        res.send({
            success: true
        })
    }).catch((error) => {
        console.log(error);
        res.send({
            success: false,
            error: error
        })
    });
 });

module.exports = router;