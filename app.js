const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const fs = require("fs");

const app = express();
app.use(helmet());
app.use(cors());

var user = {};
var path = "";

function checkKey(req, res, next) {

    res.type('application/json');
    var key = req.header('API');  
    path = "data/" + key + ".json";

    if(fs.existsSync(path)) {
        user = JSON.parse(fs.readFileSync(path, 'utf8'));
        next();
    } else {
        res.send({"authentication": "invalid"});
        
    }

};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    checkKey(req, res, next);
});

app.get('/', function(req, res) {
    res.send({"authentication": "valid"});
});

app.get("/profile", function(req, res) {
    res.send({"name": user.name, "count": user.contacts.length});
});

app.get("/contacts", function(req, res) {

    res.send({"contacts": user.contacts});

});

app.post("/contacts/add", function(req, res) {

    if(req.body.name != undefined && req.body.number != undefined) {

        user.contacts.push({
            name: req.body.name,
            number: req.body.number
        });

        fs.writeFileSync(path, JSON.stringify(user, null, "\t"));

        res.send({added: {
            name: req.body.name,
            number: req.body.number
        }});

    } else {
        res.send({error: "Could not add entry"});
    }

});

app.post("/contacts/remove", function(req, res) {

    var position = req.body.position;

    if(position != undefined) {

        if(position < user.contacts.length && position >= 0) {

            var entry = user.contacts[position];

            user.contacts.splice(position, 1);

            fs.writeFileSync(path, JSON.stringify(user, null, "\t"));

            res.send({removed: {
                name: entry.name,
                number: entry.number
            }});

        } else {

            res.send({"error": "Invalid position"});

        }

    } else {
        res.send({"error": "Could not remove entry"});
    }

});

app.listen(8080, function() {
  console.log('listening on port 8080');
});
