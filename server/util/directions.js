// Just testing
var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyBYTloS16XiccPBifkrROzkjgZnlpgZaqg'
})

googleMapsClient.directions({"origin":[33.777362,-84.390098],"destination":[33.77492,-84.396415],"mode":"driving","optimize":true}, function(err, res) {
    console.log("Got res: %j", res)
})
