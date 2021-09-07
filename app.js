const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const fs = require("fs");
const path = require('path');
const app = express();
app.use(helmet());

const userData = {user:{}, filePath:"", todo:[], contacts:[]};

module.exports = {userData}

const contacts = require('./routes/contacts/index.js')
const todo = require('./routes/todo/index.js')
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Contacts',
    version: '1.0.0',
    description: 'Simple Contact Application',
  },
  host: 'plato.mrl.ai:8080',
  servers: [
    {
      url: "http://plato.mrl.ai:8080"
    }
  ],
  basePath: '/',
};

const optionsContacts = {
  definition: swaggerDefinition,
  apis: [path.resolve(__dirname, 'app.js'), path.resolve(__dirname, 'routes/contacts/index.js')],
};
const swaggerSpec = swaggerJSDoc(optionsContacts);
const swaggerDefinitionTodo = {
  openapi: '3.0.0',
  info: {
    title: 'Todo',
    version: '1.0.0',
    description: 'Simple TODO Application',
  },
  host: 'plato.mrl.ai:8080',
  servers: [
    {
      url: "http://plato.mrl.ai:8080"
    }
  ],
  basePath: '/todo',
};

const optionsTodo = {
  definition: swaggerDefinitionTodo,
  apis: [path.resolve(__dirname, 'app.js'), path.resolve(__dirname, 'routes/todo/index.js')],
};
const swaggerSpecTodo = swaggerJSDoc(optionsTodo);

app.get('/swaggerContacts.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
app.get('/swaggerTodo.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpecTodo);
});


app.get('/contacts/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/contacts_docs.html'));
});

app.get('/todo/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/todo_docs.html'));
});

// const rateLimit = require("express-rate-limit");

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);
 /*
const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 15 minutes
  max: 120 // limit each IP to 100 requests per windowMs
});
 
//  apply to all requests
app.use(limiter);
*/

/**
 * @swagger
 * 
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:        # arbitrary name for the security scheme
 *      summary: Authenticate against the API Header
 *      type: apiKey
 *      in: header       # can be "header", "query" or "cookie"
 *      name: API        # name of the header, query parameter or cookie
 *      required: true
 *      example:   # Sample object
 *        API: example
 *   security:
 *     - ApiKeyAuth: []     # use the same name as under securitySchemes
 *   responses:
 *     UnauthorizedError:
 *       description: API key is missing or invalid
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               authentication:
 *                 type: string
 *                 value: invalid
 *             example:
 *               authentication: invalid
 *   examples:
 *     ContactExample:
 *       name: "Gandalf"
 *       number: "555-566-5634"
 *   schemas:
 *     Contact:
 *       type: object
 *       required:
 *         - name
 *         - number
 *       properties:
 *         name: 
 *           type: string
 *         number:
 *           type: string
 *     TodoItem:
 *       type: object
 *       required:
 *         - text
 *         - priority
 *       default:
 *         - completed: false
 *       properties:
 *         text: 
 *           type: string
 *         priority:
 *           type: number
 *         details:
 *           type: string
 *         deadline:
 *           type: string
 *         completed:
 *           type: boolean
 * 
 */
function checkKey(req, res, next) {
    res.type('application/json');
    var key = req.header('API');  
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    userData.filePath = "data/" + key + ".json";
    if(fs.existsSync(userData.filePath)) {
      console.log(new Date().toDateString() + ip + " " + key + " " + req.path)
      userData.user = JSON.parse(fs.readFileSync(userData.filePath, 'utf8'));
      if(userData.user.contacts === undefined)
      userData.user.contacts = []
      if(userData.user.todo === undefined)
      userData.user.todo = []
      req.userData = userData
      
      next();
    } else {
        console.log("Rejected: " + new Date().toDateString() + ip + " " + key + " " + req.path)
        res.status(401).send({"authentication": "invalid"});   
    }
};

app.use(bodyParser.json());
app.use(function (error, req, res, next) {
  if (error instanceof SyntaxError) {
    res.status(400).send("Error parsing JSON")
  } else {
    next();
  }
});
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    checkKey(req, res, next);
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Check for valid API Header
 *     description: Provides feedback on a valid API key.
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authentication:
 *                   type: string
 *               example:
 *                 authentication: valid
 *       '401':
 *          $ref: "#/components/responses/UnauthorizedError"
 */
app.get('/', function(req, res) {
    res.send({"authentication": "valid"});
});

/************************************************************** */
// Contacts app 
/************************************************************** */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Retrieve profile of a user authenticated
 *     description: Gives name and number of contacts
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 count:
 *                   type: number
 *               example:
 *                 name: "Example"
 *                 number: 2
 *       '401':
 *          $ref: "#/components/responses/UnauthorizedError"
 */
app.get("/profile", function(req, res) {
    res.send({"name": userData.user.name, "count": userData.user.contacts.length});
});

app.use("/contacts", contacts)

/************************************************************** */
// TODO App
/************************************************************** */
app.use("/todo", todo)

app.listen(8079, function() {
  console.log('listening on port 8079');
});