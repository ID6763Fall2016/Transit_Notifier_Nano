// Just testing
var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyBYTloS16XiccPBifkrROzkjgZnlpgZaqg'
})

var origin = {"lat":33.777362, "lng":-84.390098, "t": "techsqua"}
var d0 = {"lat":33.774920, "lng":-84.396415, "t": "clough"}
googleMapsClient.directions({"origin":origin, "destination":d0, "mode":"driving","optimize":true}, function(err, res) {
    console.log("Got res: %j", res)
})
