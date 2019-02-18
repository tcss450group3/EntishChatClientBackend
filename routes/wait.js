//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express router
var router = express.Router();

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

router.get("/", (req, res) => {
    res.send({
        //req.query is a reference to arguments in the url
        message: "Thanks for waiting"
    });
});

router.post("/", (req, res) => {

    res.send({
        //req.query is a reference to arguments in the POST body
        message: "Thanks for waiting"
    });
});

module.exports = router;
