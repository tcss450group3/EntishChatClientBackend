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
    let id = req.body['id'];
    db.manyOrNone('SELECT Username, verified FROM MEMBERS, CONNECTIONS WHERE MemberID = MemberID_A AND MemberID_B = $1 UNION SELECT Username, Verified FROM MEMBERS, CONNECTIONS WHERE MemberID = MemberID_B AND MemberID_A = $1 ', [id])
    //If successful, run function passed into .then()
    .then((data) => {
        res.send({
            connections: data
        });
    }).catch((error) => {
        console.log(error);
        res.send({
success: false,
            error: error
        })
}); });
module.exports = router;