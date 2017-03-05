var http = require('http');
require('dotenv').config()
const TRANSLINK_API_KEY = process.env.TRANSLINK_API_KEY

var options = {
  host: 'www.api.translink.ca',
  path: '/rttiapi/v1/buses?apikey=' + TRANSLINK_API_KEY
};

function request() {
  http.request(options, function(res){
    res.on('data', function(chunk){
       console.log(chunk);
    });
  }).on("error", function(e){
    console.log("Got error: " + e.message);
  });
}

module.exports = function(){
	setInterval(request, 2000);
}