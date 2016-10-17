// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express')        // call express
var app        = express()                 // define our app using express
app.use('/m', express.static("static"))
var http = require("http")
var http_server = http.createServer(app)
var fs = require("fs")
var util = require("util")
var qs = require('querystring')
var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyBYTloS16XiccPBifkrROzkjgZnlpgZaqg'
})
//googleMapsClient.geocode({
//  address: '1600 Amphitheatre Parkway, Mountain View, CA'
googleMapsClient.directions({
    "origin": [33.776902, -84.389960]
    ,"destination": [33.775216, -84.396134]
    ,"mode": "driving" // driving, walking, cycling, or transit
    ,"optimize": true
}, function(err, response) {
  if (!err) {
    console.log("%d routs found, r0 has %d sections ", response.json.routes.length, response.json.routes[0].legs.length)
    console.log(JSON.stringify(response.json.routes[0].legs[0].duration, undefined, 2))
  } else {
    console.log(e.message)
  }
});

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
var entries = [
      {"a": "georgia-tech", "r": "trolley", "s": "techsqua", "d": "hub"}
    , {"a": "georgia-tech", "r": "tech", "s": "techsqua", "d": "clough"}
]
var key = "f87420183e937d06913347ded6d8777a" // default
function ask_next_bus() {
    // Reload key, which will be manually updated for now, daily, not so bad
    fs.readFile("next_bus_key", function(err, data) {
        if(err) {
            console.log("Error reading key: %s\nUsing old one: %s\n", err.message, key)
        } else {
            key = String(data).trim()
        }
        query_api(entries[0])
        query_api(entries[1])
    })
}
function query_api(r) {
        var params = {"coincident": true, "direction": r.d, "key": key, "timestamp": new Date().getTime()}
        var template = "/api/pub/v1/agencies/%s/routes/%s/stops/%s/predictions?%s"
        var path = util.format(template, r.a, r.r, r.s, qs.stringify(params))
        console.log("path = %s", path)
        http.get({
              "host": "www.nextbus.com"
            , "path": path
            , "headers": api_headers
        }, function(res) {
            res.on("data", function(chunk) {
                console.log("API Body: " + chunk)
            })
        }).on("error", function(err) {
            console.log("API query error, %s, restart session in 5 seconds...", error.message)
            if(null != ask_interval_id) {
                clearInterval(ask_interval_id)
                ask_interval_id = null
            }
            setTimeout(restart_session, 5000)
        })
}

var restarting = false;
function restart_session() {
    if(restarting) return
    http.get(home_req_opts, function(res) {
        if('set-cookie' in res.headers) {
            api_headers["cookie"] = res.headers["set-cookie"]
            console.log("Cookie recorded:D")
        }
        restarting = false
        // Really do not care about the content of this request
        res.resume()
        if(null != ask_interval_id) {
            clearInterval(ask_interval_id)
            ask_interval_id = null
        }
        ask_interval_id = setInterval(ask_next_bus, 5000)
    }).on("error", function(e) {
        restarting = false
        console.log("Got error, %s, retry in 5 seconds...", error.message)
        setTimeout(restart_session, 5000)
    })
}

restart_session()

