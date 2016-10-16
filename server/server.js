// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express')        // call express
var app        = express()                 // define our app using express
app.use('/m', express.static("static"))
var http_server = require("http").createServer(app)

var bodyParser = require('body-parser');
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var io = require('socket.io')(http_server);


// get port
var nconf = require("nconf")
nconf.argv().env()
var cfg_name = nconf.get("conf") || "conf.json"
nconf.file({ "file": cfg_name })
nconf.defaults({
	  "port": 8080
})
var port = nconf.get("port")

http_server.listen(port)

chalk = require("chalk")
console.log(chalk.yellow('Magic happens on port %d'), port)

// IO socket stuff
var id2skt = {}
var cnt = 0
var pick_cache = null
io.on("connection", function(socket) {
    var id = cnt
    cnt ++
    console.log("Client %d connected", id)
    id2skt[id] = socket
    socket.on("disconnect", function() {
        console.log("Client disconnected: %d, clear sockt @%d. ", id, id)
        delete id2skt[id]
    })
})

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router
app.use("/api", router);

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ msg: "We like you!" });
})

router.get('/suggest', function(req, res) {
    res.json({
      "clough": {"next": [4, 6, 10], "ahead": 8}
    , "klaus": {"next": [2, 8], "ahead": 6}
    });
})

