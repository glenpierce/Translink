var http = require('http');

var options = {
  host: 'example.com',
  port: 80,
  path: '/'
};

function request() {
  http.get(options, function(res){
    res.on('data', function(chunk){
       console.log(chunk);
    });
  }).on("error", function(e){
    console.log("Got error: " + e.message);
  });
}

module.exports = function(){
	// var request = function (){
	// 	console.log('not repeating yetS')
	// }
	setInterval(request, 600);
}