//express is the framework we're going to use to handle requests 
const express = require('express');
//Create connection to Heroku Database
let db = require('../utilities/utils').db;
//function to send emails.
let sendEmail = require('../utilities/utils').sendEmail;

let msg_functions = require('../utilities/utils').messaging;

var router = express.Router();
const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

//add a new connection by username
router.post("/new", (req, res) => {

    //The person this request is being sent to
    let username = req.body['username'];

    //The person sending this request
    let sender = req.body['sender'];
    let MemberID_A = req.body['id'];
    
    if(username !=0){
        db.manyOrNone('SELECT MemberID FROM MEMBERS WHERE Username = $1', [username])
        .then((data) => {
            let theData = data[0];
            let MemberID_B = theData['memberid'];
            let params = [MemberID_A, MemberID_B];
            var match;
            db.manyOrNone(`SELECT (MemberID_A = $1) AS match FROM Connections WHERE MemberID_B = $2
                            UNION
                            SELECT (MemberID_A = $2) AS match FROM Connections WHERE MemberID_B = $2`, params)
            .then(rows =>{
                rows.forEach(element => {
                    if(element['match']) match = true;
                });
            if (MemberID_A == MemberID_B) {
                res.send({
                    success: false,
                    error: 'cannot add self as connection'
                })
            } else if(match) {
                res.send({
                    success: false,
                    error: 'You already have a connection with that user'
                });  
            } else {
                db.none('INSERT INTO Connections (MemberID_A, MemberID_B, Verified) VALUES ($1, $2, 1)', params)
                    .then(() => {
                        db.manyOrNone('SELECT * FROM Push_Token WHERE MemberID = $1', [MemberID_B])
                        .then(rows => {
                            rows.forEach(element => {
                                msg_functions.sendRequest(element['token'], sender);
                            });
                        });
                        res.send({
                            success: true
                        })
                    }).catch((error) => {
                        console.log(error);
                        res.send({
                            success: false,
                            error: "could not insert new connection" + error,
                        })
                    });
            }

        });
        }).catch((error) => {
            console.log(error);
            res.send({
                success: false,
                error: " couldn't find the requested username to make a connection" + error
            })
        });
    } else {
        res.send({
            success:false,
            error: 'no details sent'
        })
    }
      
 });

 //send an fake email invitation request.
 router.post("/email", (req, res) => {
     let email = req.body['email'];
     let sender = req.body['sender'];
     if(email && email.includes("@")){
         res.send({
            success: true
         });

        sendEmail("uwnetid@uw.edu", email, "Join " + sender + " on Entish!", "Hello "
         + email + "! you were invited to Entish by " + sender + " use this link to join.");
     } else {
         res.send({
            success: false,
            error: 'Recipient email was invalid'
         });
     }

 });


 //accept a connection request

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

//get all connections that include the member's id
router.post("/get", (req, res) => {
    let id = req.body['id'];
    db.manyOrNone(`SELECT Username, verified, PrimaryKey, (MEMBERID_A != $1 AND verified = 1) AS "request" FROM MEMBERS, CONNECTIONS
    WHERE MemberID = MemberID_A AND MemberID_B = $1
    UNION 
    SELECT Username, Verified, PrimaryKey,(MEMBERID_A != $1 AND verified = 1) AS "request" FROM MEMBERS, CONNECTIONS 
    WHERE MemberID = MemberID_B AND MemberID_A = $1 ORDER BY request DESC, username ASC`, [id])
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

router.post("/delete", (req, res) => {
    let id = req.body['id'];
    db.none(`DELETE FROM Connections WHERE PrimaryKey = $1`, [id])
    //If successful, return true
    .then((data) => {
        res.send({
            success: true
        });
    }).catch((error) => {
        console.log(error);
        res.send({
            success: false,
            error: error
        })
}); });

module.exports = router;