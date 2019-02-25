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

router.post("/new", (req, res) => {

    let email = req.body['email'];
    let username = req.body['username'];
    let MemberID_A = req.body['id'];
    
    if(email != 0){
        db.manyOrNone('SELECT MemberID FROM MEMBERS WHERE Email = $1', [email])
        .then((data) => {
            let theData = data[0];
            let MemberID_B = theData['memberid'];
            let params = [MemberID_A, MemberID_B];
            db.none('INSERT INTO Connections (MemberID_A, MemberID_B, Verified) VALUES ($1, $2, 1)', params) 
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
        }).catch((error) => {
            console.log(error);
            res.send({
                success: false,
                error: error
            })
        });
    } else if(username !=0){
        db.manyOrNone('SELECT MemberID FROM MEMBERS WHERE Username = $1', [username])
        .then((data) => {
            let theData = data[0];
            let MemberID_B = theData['memberid'];
            let params = [MemberID_A, MemberID_B];
            db.none('INSERT INTO Connections (MemberID_A, MemberID_B, Verified) VALUES ($1, $2, 1)', params) 
            .then(() => {
                res.send({
                    success: true
                })
            }).catch((error) => {
                console.log(error);
                res.send({
                    success: false,
                    error: error,
                })
            });
        }).catch((error) => {
            console.log(error);
            res.send({
                success: false,
                error: error
            })
        });
    } else {
        res.send({
            success:false,
            error: 'no details sent'
        })
    }
      
 });

 router.post("/accept", (req, res) => {

    let connectionID = req.body['id'];
    
    db.manyOrNone('UPDATE Connections SET Verified = -1 WHERE PrimaryKey = $1', [connectionID])
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


router.post("/get", (req, res) => {
    let id = req.body['id'];
    db.manyOrNone('SELECT Username, verified, PrimaryKey FROM MEMBERS, CONNECTIONS WHERE MemberID = MemberID_A AND MemberID_B = $1 UNION SELECT Username, Verified, PrimaryKey FROM MEMBERS, CONNECTIONS WHERE MemberID = MemberID_B AND MemberID_A = $1 ', [id])
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