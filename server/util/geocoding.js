/**
 *
 * Getting lat/lng from google, since it is seldom changing, no need to run them in the main server routine
 *
 **/
var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyBYTloS16XiccPBifkrROzkjgZnlpgZaqg'
})

var addrs = [
      "Moe's Southwest Grill, 85 5th St NW, Atlanta, GA 30308"
    , "Technology Square Research Building, 5th Street Northwest, Atlanta, GA"
    , "Klaus Advanced Computing Building, 266 Ferst Dr NW, Atlanta, GA 30332"
    , "Clough Undergraduate Learning Commons, 266 4th Street Northwest, Atlanta, GA 30313"
]

var i = 0;

function exec_geocoding() {
    if(i >= addrs.length) {
        console.log("All geocoding is done, exiting...")
        process.exit(0)
    }
    var addr = addrs[i]
    googleMapsClient.geocode({
      address: addr
    }, function(err, response) {
      if(!err && 0 < response.json.results.length) {
        var loc = response.json.results[0].geometry.location
        console.log("{\"lat\":%s, \"lng\":%s} for %s", loc.lat.toFixed(6), loc.lng.toFixed(6), addr)
      } else {
        console.log("Failed to encode %s", addr)
      }
      i++
      setTimeout(exec_geocoding, 500)
    })
}

exec_geocoding()

