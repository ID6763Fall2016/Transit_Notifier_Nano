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
        , "google-key": "AIzaSyDa3irr6AsrZF8ta8PSKiFxSDTTiIhPKU8"
})
var port = nconf.get("port")

http_server.listen(port)

chalk = require("chalk")
console.log(chalk.yellow('Magic happens on port %d'), port)
var dir_clients = nconf.get("google-key").split(",").map(function(d) {
    return require('@google/maps').createClient({
      key: d
    })
})
var dir_api_cd = Math.ceil(36 / dir_clients.length)
console.log("%d api keys will rotate, query countdown %d", 
    dir_clients.lenth, dir_api_cd)
var dir_idx = 0;
function get_dir_cli() {
    var ret = dir_clients[dir_idx]
    dir_idx = (dir_idx + 1) % dir_clients.length
    return ret
}

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
// Simulate crowdedness
router.get('/sim/:id/:value', function(req, res) {
    var id = req.params.id
    if(!(id in answer)) {
        res.json({"msg": "Id not found"})
        return
    }
    var value = req.params.value
    answer[id]["c"] = "1" == value || "true" == value
    res.json({"msg": id + " updated", "c": answer[id]["c"]})
})

router.get("/next/:id/:sec", function(req, res) {
    var id = req.params.id
    if(!(id in answer)) {
        res.json({"msg": "Id not found"})
        return
    }
    answer[id]["n"] = [+req.params.sec]
    res.json({"msg": id + " next updated", "a": answer})
})
var missing = -1 // to save sapce
var answer = { // c - clough, k - klaus, n - next, a - ahead, c - crowded, w - walk
      "c": {"n": [missing], "a": missing, "c": 0, "w": 623}
    , "k": {"n": [missing], "a": missing, "c": 1, "w": 518}
    , "c2k": {"w": 181 }
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
      {"a": "georgia-tech", "r": "trolley", "s": "techsqua", "d": "hub", "t": "k"}
    , {"a": "georgia-tech", "r": "tech", "s": "techsqua", "d": "clough", "t": "c"}
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
                var next = [missing]
                if(0 < ro.length && ro[0].hasOwnProperty("values") && 0 < ro[0]["values"].length) {
                    var next = ro[0].values.map(function(d) { return Math.round(+d["minutes"] * 60) })
                } else {
                    console.log("Next-Bus API response not useful: %s", chunk)
                }
                if(r["t"] in answer) {
                    answer[r["t"]]["n"] = next
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
    }).on("error", function(err) {
        restarting = false
        console.log("Got error, %s, retry in 5 seconds...", err.message)
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
      {"o": techsqua, "d": klaus, "m": "driving", "t": "k", "f": "a"}
    , {"o": techsqua, "d": clough, "m": "driving", "t": "c", "f": "a"}
    , {"o": techsqua, "d": klaus, "m": "walking", "t": "k", "f": "w"}
    , {"o": techsqua, "d": clough, "m": "walking", "t": "c", "f": "w"}
    , {"o": klaus, "d": clough, "m": "walking", "t": "c2k", "f": "w"}
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
    get_dir_cli().directions(opts, function(err, response) {
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
                answer[q["t"]][q["f"]] = seconds
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
setInterval(ask_google_maps, dir_api_cd * 1000)

// Record google api results
var tingo = require('tingodb')();
var db = new tingo.Db(__dirname + '/db', {});
var nav_stats = db.collection("nav")

