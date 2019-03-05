var API_KEY = process.env.WEATHER_BIT_API_KEY;

//express is the framework we're going to use to handle requests
const express = require('express');

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

const request = require('request');

let getHash = require('../utilities/utils').getHash;

var router = express.Router();

const bodyParser = require("body-parser");

router.use(bodyParser.json());

router.post("/current", (req, res) => {

    let lat = req.body['latitude'];
    let lon = req.body['longitude'];
    let zip = req.body['zipcode'];
    var url;
    if (zip == "") {
        url = `https://api.weatherbit.io/v2.0/units=[I]/current?lat=${lat}&lon=${lon}&key=${API_KEY}`;
    } else {
        url = `https://api.weatherbit.io/v2.0/units=[I]/current?postal_code=${zip}&key=${API_KEY}`;
    }

    request(url, function (error, response, body) {
        if (error) {
            res.send(error);
            res.send(error);
        } else {
            res.send(body);
        }
    });    
});


router.post('/forecast/daily', (req, res) => {
    let lat = req.body['latitude'];
    let lon = req.body['longitude'];
    let zip = req.body['zipcode'];
    var url;
    if (zip == "") {
        url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&days=10&key=${API_KEY}`;
    } else {
        url = `https://api.weatherbit.io/v2.0/forecast/daily?postal_code=${zip}&days=10&key=${API_KEY}`;
    }
    
    request(url, function (error, response, body) {
        if (error) {
            res.send(error);
        } else {
            res.send(body);
        }
    }); 
});

router.post('/forecast/hourly', (req, res) => {
    let lat = req.body['latitude'];
    let lon = req.body['longitude'];
    let zip = req.body['zipcode'];
    var url;
    if (zip == "") {
        url = `https://api.weatherbit.io/v2.0/forecast/hourly?lat=${lat}&lon=${lon}&hours=24&key=${API_KEY}`;
    } else {
        url = `https://api.weatherbit.io/v2.0/forecast/hourly?postal_code=${zip}&hours=24&key=${API_KEY}`;
    }
    
    request(url, function (error, response, body) {
        if (error) {
            res.send(error);
        } else {
            res.send(body);
        }
    }); 
});

module.exports = router;
