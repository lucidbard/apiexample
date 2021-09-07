var express = require('express');
var router = express.Router();

const fs = require("fs");
/************************************************************** */
// Contacts app 
/************************************************************** */

/**
* @swagger
* /contacts:
*   get:
*     summary: Retrieve a list of contacts
*     description: Gives name and number of contacts
*     responses:
*       200:
*         description: OK
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 contacts:
*                   type: array
*                   items:
*                     type: object
*                     properties:
*                       name:
*                         type: string
*                       number:
*                         type: string
*               example:
*                 contacts:
*                   - name: "Batman"
*                     number: "555-534-2451"
*                   - name: "Robin"
*                     number: "555-534-2451"
*       '401':
*          $ref: "#/components/responses/UnauthorizedError"
*/
router.get("/", function(req, res) {
  // console.log(req.userData)
  res.send({"contacts": req.userData.user.contacts});
});

/**
* @swagger
* /contacts/add:
*   post:
*     summary: Add a new contact
*     description: Creates and adds a new contact
*     requestBody:
*       description: The details of the new contact
*       content: 
*         application/json:
*           schema:
*             $ref: '#/components/schemas/Contact'
*           example:
*             $ref: '#/components/examples/ContactExample'
*     responses:
*       200:
*         description: OK
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 added:
*                   $ref: '#/components/schemas/Contact'
*             example:
*               added:
*                 name: "Batman"
*                 number: "555-534-2451"
*       '401':
*          $ref: "#/components/responses/UnauthorizedError"
*/
router.post("/add", function(req, res) {
    console.log(req.body)
  if(req.body.name != undefined && req.body.number != undefined) {
      req.userData.user.contacts.push({
          name: req.body.name,
          number: req.body.number
      });
      fs.writeFileSync(req.userData.filePath, 
        JSON.stringify(req.userData.user, null, "\t"));
      res.send({added: {
          name: req.body.name,
          number: req.body.number
      }});
  } else {
      res.send({error: "Could not add entry"});
  }
});

/**
* @swagger
* /contacts/remove:
*   post:
*     summary: Removes contact by position
*     description: Deletes the contact from the array at the given 0-indexed location.
*     requestBody:
*       description: The position to remove
*       required: true
*       content: 
*         application/json:
*           schema:
*             type: object
*             required: 
*               - position
*             properties:
*               position:
*                 type: number
*     responses:
*       200:
*         description: OK
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 removed:
*                   $ref: '#/components/schemas/Contact'
*               example:
*                 removed:
*                   name: "Bruce Wayne"
*                   number: "555-243-1234"
*       '401':
*          $ref: "#/components/responses/UnauthorizedError"
*/
router.post("/remove", function(req, res) {
  console.log(req.body)
  console.log(`Removing contact for ${req.userData.user.name} at position ${req.body.position}`)
  var position = req.body.position;
  if(position === undefined) {
    res.send({"error": "position is undefined"});
  } else if (position < req.userData.user.contacts.length && position >= 0) {
      var entry = req.userData.user.contacts[position];
        req.userData.user.contacts.splice(position, 1);
        fs.writeFileSync(req.userData.filePath, JSON.stringify(req.userData.user, null, "\t"));
        res.send({removed: {
            name: entry.name,
            number: entry.number
        }});
  } else {
    res.send({"error": "Invalid position"});
  }
});

module.exports = router