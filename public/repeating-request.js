var http = require('http');
require('dotenv').config();
const TRANSLINK_API_KEY = process.env.TRANSLINK_API_KEY;

var request=require("request");

var requost = function(){
	request.get('http://api.translink.ca/rttiapi/v1/buses?apikey=' + TRANSLINK_API_KEY,
		function(error,response,body){
		       if(error){
		             console.log('error:', error);
		       }else{
		             console.log(response);
		     }
		})
};

module.exports = function(){
	setInterval(requost, 2000);
};