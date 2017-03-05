require('dotenv').config();

//require the Twilio module and create a REST client
var client = require('twilio')(process.env.TWILIO_CLIENT_ID, process.env.TWILIO_API_KEY);
var from_number = '+15167174604';
var send_sms = {};
//Send an SMS text message
send_sms.alert = function(number, message) {
    number = number.toString().replace(/\D/g, '');
    if(number.length != 10) { console.log('invalid phone number'); return}
    client.sendMessage({
        to:'+1' + number, // Any number Twilio can deliver to
        from: from_number, // A number you bought from Twilio and can use for outbound communication
        body: message // body of the SMS message

    }, function(err, responseData) { //this function is executed when a response is received from Twilio
        if (!err) { // "err" is an error received during the request, if any
            console.log(responseData.from); // outputs "+14506667788"
            console.log(responseData.body); // outputs "word to your mother."
        } else {
            console.log('err', err);
        }
    });
};

module.exports = send_sms;