var express = require('express');
var router = express.Router();

const fs = require("fs");
/**
* @swagger
* /todo:
*   get:
*     summary: Retrieve TODO items
*     description: Provides tasks and details
*     responses:
*       200:
*         description: OK
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 type: object
*                 $ref: "#/components/schemas/TodoItem"
*               example:
*                 - text: "Carry out evil plan"
*                   priority: 0
*                   details: "Take over Gotham"
*                   deadline: "High noon"
*                   completed: false
*                 - text: "Celebrate"
*                   priority: 0
*                   details: "Let there be cake"
*                   deadline: "After"
*                   completed: false
*       '401':
*          $ref: "#/components/responses/UnauthorizedError"
*/
router.get("/", function(req, res) {
  res.send({"todo": req.userData.user.todo});
});

/**
* @swagger
* /todo/status:
*   get:
*     summary: Retrieve user's status
*     description: Provides number of tasks completed
*     responses:
*       200:
*         description: OK
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 type: object
*                 properties:
*                   name:
*                     type: string
*                   completed:
*                     type: number
*                   total:
*                     type: number
*               example:
*                 name: "Murray"
*                 completed: 30
*                 total: 100
*       '401':
*          $ref: "#/components/responses/UnauthorizedError"
*/
router.get("/status", function(req, res) {
  var reducer = function (accumulator, item) {
    return accumulator + (item.completed ? 0 : 1)
  }
  var total = req.userData.user.todo.reduce(reducer, 0)
  res.send({"name": req.userData.user.name, "completed": total, "total": req.userData.user.todo.length});
});

/**
* @swagger
* /todo/add:
*   post:
*     summary: Add a new TODO task
*     description: Creates and adds a new TODO task
*     requestBody:
*       description: The details of the new task
*       required: true
*       content: 
*         application/json:
*           schema:
*             $ref: '#/components/schemas/TodoItem'
*     responses:
*       200:
*         description: OK
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 added:
*                   $ref: '#/components/schemas/TodoItem'
*             example:
*               added:
*                 text: "Save the world"
*                 details: "By saving the cheerleader"
*                 priority: 0
*                 deadline: "TBD"
*                 completed: false
*       '401':
*          $ref: "#/components/responses/UnauthorizedError"
*/
router.post("/add", function(req, res) {
  console.log("Adding task", req.userData.user.todo)
  if(req.body.text != undefined && req.body.priority != undefined) {
    const item = {
      text: req.body.text,
      priority: req.body.priority,
      details: req.body.details,
      deadline: req.body.deadline,
      completed: false
    }
    req.userData.user.todo.push(item);
  console.log("Adding task", req.userData.user.todo)
  fs.writeFileSync(req.userData.filePath, JSON.stringify(req.userData.user, null, "\t"));
      res.send({added: item});
    } else {
      res.send({error: "Could not add entry"});
    }
  });

/**
* @swagger
* /todo/remove:
*   post:
*     summary: Removes TODO task by position
*     description: Deletes the task from the array at the given 0-indexed location.
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
*                   $ref: '#/components/schemas/TodoItem'
*               example:
*                 removed:
*                   text: "Save the world"
*                   details: "By saving the cheerleader"
*                   priority: 0
*                   deadline: "TBD"
*                   completed: false
*       '401':
*          $ref: "#/components/responses/UnauthorizedError"
*/
  router.post("/remove", function(req, res) {
    var position = req.body.position;
    if(position != undefined) {
        if(position < req.userData.user.todo.length && position >= 0) {
            var entry = req.userData.user.todo[position];
            req.userData.user.todo.splice(position, 1);
            fs.writeFileSync(req.userData.filePath, JSON.stringify(req.userData.user, null, "\t"));
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
  
  /**
* @swagger
* /todo/setState:
*   post:
*     summary: Updates the status of a TODO item
*     description: Sets a TODO item at a position's property completed to true or false 
*     requestBody:
*       description: The position to update and its new status (true/false)
*       content: 
*         application/json:
*           schema:
*             type: object
*             properties:
*               position:
*                 type: number
*               status:
*                 type: boolean
*             required: 
*               - position
*               - status
*     responses:
*       200:
*         description: OK
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 updated:
*                   $ref: '#/components/schemas/TodoItem'
*               example:
*                 updated:
*                   text: "Save the world"
*                   details: "By saving the cheerleader"
*                   priority: 0
*                   deadline: "TBD"
*                   completed: true
*       '401':
*          $ref: "#/components/responses/UnauthorizedError"
*/
  router.post("/setState", function(req, res) {
    if(req.userData.user.todo === undefined) {
      req.userData.user.todo = []
    }
    var position = req.body.position;
    var status = req.body.status;
    if(position != undefined) {
        if(status != undefined && position < req.userData.user.todo.length && position >= 0) {
            var entry = req.userData.user.todo[position];
            entry.completed = status
            console.log(entry)
            fs.writeFileSync(req.userData.filePath, JSON.stringify(req.userData.user, null, "\t"));
            res.send({updated:
                req.userData.user.todo[position]
            });
        } else {
            res.send({"error": "Invalid position"});
        }
    } else {
        res.send({"error": "Could not remove entry"});
    }
});

module.exports = router;