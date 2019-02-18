//express is the framework we're going to use to handle requests
const express = require('express');

//We use this create the SHA256 hash
const crypto = require("crypto");

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

let getHash = require('../utilities/utils').getHash;

let sendEmail = require('../utilities/utils').sendEmail;

var router = express.Router();

var VerifyCode;

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

// Register endpoint
router.post('/', (req, res) => {
    res.type("application/json");

    //Retrieve data from query params
    var first = req.body['first'];
    var last = req.body['last'];
    var username = req.body['username'];
    var email = req.body['email'];
    var password = req.body['password'];
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(first && last && username && email && password) {
        //We're storing salted hashes to make our application more secure
        //If you're interested as to what that is, and why we should use it
        //watch this youtube video: https://www.youtube.com/watch?v=8ZtInClXe1Q
        let salt = crypto.randomBytes(32).toString("hex");
        let salted_hash = getHash(password, salt);
        
        //Use .none() since no result gets returned from an INSERT in SQL
        //We're using placeholders ($1, $2, $3) in the SQL query string to avoid SQL Injection
        //If you want to read more: https://stackoverflow.com/a/8265319
        let params = [first, last, username, email, salted_hash, salt];
        db.none("INSERT INTO MEMBERS(FirstName, LastName, Username, Email, Password, Salt) VALUES ($1, $2, $3, $4, $5, $6)", params)
        .then(() => {
            //We successfully added the user, let the user know
            res.send({
                success: true
            });



            db.one('SELECT MemberID FROM Members WHERE Email=$1', [email])
            .then(row => {
                VerifyCode = Math.floor(1000 + Math.random() * 9000);
                console.log(VerifyCode);
                db.none("INSERT INTO verified", [VerifyCode])
                .then(() => {}
            )});


            sendEmail("uwnetid@uw.edu", email, "Welcome!", "<strong>Welcome to our app! Please enter the following code to verify </strong>" + VerifyCode.toString);
        }).catch((err) => {
            //log the error
            console.log(err);
            //If we get an error, it most likely means the account already exists
            //Therefore, let the requester know they tried to create an account that already exists
            res.send({
                success: false,
                error: err
            });
        });
    } else {
        res.send({
            success: false,
            input: req.body,
            error: "Missing required user information"
        });
    }
});

// Endpoint to allow user to Resend confirmation email
// Generates new 4 digit code
router.post('/resend', (req, res) => {
    res.type("application/json");
    var username = req.body['username'];
    var email = req.body['email'];

    db.one('SELECT MemberID FROM Members WHERE Username=$1', [username])
    .then(row => {
        VerifyCode = Math.floor(1000 + Math.random() * 9000);
        console.log(VerifyCode);
        db.none("INSERT INTO email", [email])
        .then(() => {})
        db.none("INSERT INTO verified", [VerifyCode])
        .then(() => {}
    )}).catch((err) => {
        //log the error. If there was an error here, it most likely means the username was not found.
        console.log(err);
        res.send({
            success: false,
            error: "Username not found " + err
        });
    });;
});

//End Point for confirmation of 4 digit code sent
router.post("/confirm", (req, res) => {
    res.type("application/json");
    var email = req.body['email']
    var code = req.body['verification'];
    db.one('SELECT verification FROM Members WHERE Email=$1', [email])
    .then(row => {
        let v = row['verification'];
        console.log(v);
        //Verifies that   the code entered by the user matches the code in the DB
        if (v == code){
            res.send({
                success: true
            })
            // update verification to -1 
            db.none("UPDATE Members SET verification=$1 WHERE Email=$2", [-1, email])
            .then(() => {
            }).catch((err) => {
                //log the error
                console.log(err);;
            });
            
        } else {
            // The codes must not have matched. Send error to user
            res.send({
                error: "The Veirification code does not match.",
                success: false
            })
        }  
    }).catch((err) => {
        //log the error
        console.log(err);;
    });  
});


module.exports = router;
