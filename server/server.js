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
      "clough": {"next": [-1], "ahead": -1, "crowded": true, "walk": 9}
    , "klaus": {"next": [-1], "ahead": -1, "crowded": false, "walk": 7}
    , "c2k": {"walk": 4 }
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
      {"a": "georgia-tech", "r": "trolley", "s": "techsqua", "d": "hub", "t": "klaus"}
    , {"a": "georgia-tech", "r": "tech", "s": "techsqua", "d": "clough", "t": "clough"}
]
var key = "f87420183e937d06913347ded6d8777a" // default
function ask_next_bus() {
    // Reload key, which will be manually updated for now, daily, not so bad
    fs.readFile("etc/next_bus_key", function(err, data) {
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
        //console.log("path = %s", path)
        http.get({
              "host": "www.nextbus.com"
            , "path": path
            , "headers": api_headers
        }, function(res) {
            res.on("data", function(chunk) {
                console.log("Next-Bus API body of %d bytes, ",
                     chunk.length)
                var ro = JSON.parse(chunk)
                console.log("\tContents contains %d object(s) and %d values.", 
                    ro.length, 0 == ro.length? 0 : ro[0].values.length) 
                var next = [-1]
                if(0 < ro.length && ro[0].hasOwnProperty("values") && 0 < ro[0]["values"].length) {
                    var next = ro[0].values.map(function(d) { return d["minutes"] })
                }
                if(r["t"] in answer) {
                    answer[r["t"]]["next"] = next
                    console.log("\tBus predictions for %s updated to [ %s ]. ", 
                        chalk.yellow(r["t"]), chalk.green(next.join(", ")))
                }
            })
        }).on("error", function(err) {
            console.log("Next-Bus API query error: %s, restart session in 5 seconds...", err.message)
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
            console.log("Next-Bus Cookie recorded:D")
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
        setTimeout(restart_session, 15 * 1000)
    })
}

restart_session()

// Results from geo coding
// Technology Square Research Building, 5th Street Northwest, Atlanta, GA
var techsqua = {"lat":33.777362, "lng":-84.390098, "n": "techsqua"}
// Klaus Advanced Computing Building, 266 Ferst Dr NW, Atlanta, GA 30332
var klaus = {"lat":33.777191, "lng":-84.396202, "n": "klaus"}
// Clough Undergraduate Learning Commons, 266 4th Street Northwest, Atlanta, GA 30313
var clough = {"lat":33.774920, "lng":-84.396415, "n": "clough"}
var queries = [
      {"o": techsqua, "d": klaus, "m": "driving", "t": "klaus", "f": "ahead"}
    , {"o": techsqua, "d": clough, "m": "driving", "t": "clough", "f": "ahead"}
    , {"o": techsqua, "d": klaus, "m": "walking", "t": "klaus", "f": "walk"}
    , {"o": techsqua, "d": clough, "m": "walking", "t": "clough", "f": "walk"}
    , {"o": klaus, "d": clough, "m": "walking", "t": "c2k", "f": "walk"}
]
var agm_rec = {"i": 0, "working": false, "list": queries}

function ask_google_maps() {
    if(agm_rec["working"]) {
        console.log("Google maps queries underway, skipping echo attempts...")
        return
    }
    agm_rec["working"] = true 
    var q = agm_rec["list"][agm_rec["i"] % agm_rec["list"].length]
    // driving, walking, cycling, or transit
    var opts = { "origin": q.o ,"destination": q.d ,"mode": q.m ,"optimize": true }
    googleMapsClient.directions(opts, function(err, response) {
      if ((!err) && (0 < response.json.routes.length)) {
        var r0 = response.json.routes[0]
        console.log("Google maps returned %d routs, r0 has %d sections ", response.json.routes.length, r0.legs.length)
        if(0 == r0.legs.length) {
            console.log("No sections found by Google:( ")
        } else {
            var seconds = r0.legs[0].duration.value
            console.log("\tIt takes %s seconds' %s from %s to %s", 
                chalk.green(seconds), q.m, chalk.yellow(q.o.n), chalk.yellow(q.d.n))
            if(q["t"] in answer) {
                answer[q["t"]][q["f"]] = seconds / 60.0
                nav_stats.insert({"o": q.o.n, "d": q.d.n, "sec": seconds, "ts": new Date().getTime()})
            }
        }
      } else {
        console.log(e.message)
      }
      agm_rec["working"] = false
      agm_rec["i"] ++
    });
}
setTimeout(ask_google_maps, 100)
setTimeout(ask_google_maps, 2600)
setInterval(ask_google_maps, 6 * 1000)

// Record google api results
var tingo = require('tingodb')();
var db = new tingo.Db(__dirname + '/db', {});
var nav_stats = db.collection("nav")

