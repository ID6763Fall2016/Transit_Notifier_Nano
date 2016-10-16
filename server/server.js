// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express')        // call express
var app        = express()                 // define our app using express
app.use('/m', express.static("static"))
var http = require("http")
var http_server = http.createServer(app)

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
    res.json(answer)
})
var answer = {
      "clough": {"next": [-1], "ahead": -1, "crowded": true}
    , "klaus": {"next": [-1], "ahead": -1, "crowded": false}
}

var user_agent = "Mozilla/5.0"
var home_req_opts = {
    "host": "www.nextbus.com"
    , "path": "/"
    , "headers": {
          "user-agent": user_agent
    }
}
var api_headers = {
    "referer": "http://www.nextbus.com"
    , "cookie": ""
    , "user-agent": user_agent
}
var ask_interval_id = null
function ask_next_bus() {
    http.get({
        "host": "www.nextbus.com"
        , "path": "/api/pub/v1/agencies/atlanta-sc/routes/ASC/stops/4560589/predictions?coincident=true&direction=ASC_0_var1&key=f87420183e937d06913347ded6d8777a&timestamp=" + new Date().getTime()
        , "headers": api_headers
    }, function(res) {
        res.on("data", function(chunk) {
            console.log("API Body: " + chunk)
        })
    }).on("error", function(err) {
        console.log("API query error, %s, restart session in 5 seconds...", error.message)
        setTimeout(restart_session, 5000)
    })
}

function restart_session() {
    http.get(home_req_opts, function(res) {
        if('set-cookie' in res.headers) {
            api_headers["cookie"] = res.headers["set-cookie"]
            console.log("Cookie recorded:D")
        }
        res.resume()
        ask_interval_id = setInterval(ask_next_bus, 5000)
    }).on("error", function(e) {
        console.log("Got error, %s, retry in 5 seconds...", error.message)
        setTimeout(restart_session, 5000)
    })
}

restart_session()

