var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

var http = require('http');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', index);
app.get('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

require('dotenv').config();

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : process.env.MYSQL_PASSWORD,
    database : 'translink'
});

connection.connect();

var options = {
    host: 'api.translink.ca',
    path: '/rttiapi/v1/buses?apikey=' + process.env.TRANSLINK_API_KEY,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

var repeatingRequest = function() {
    http.get(options, (res) => {
        const statusCode = res.statusCode;
        const contentType = res.headers['content-type'];

        var error;
        if (statusCode !== 200) {
            error = new Error(`Request Failed.\n` +
                `Status Code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
            error = new Error(`Invalid content-type.\n` +
                `Expected application/json but received ${contentType}`);
        }
        if (error) {
            console.log(error.message);
            // consume response data to free up memory
            res.resume();
            return;
        }

        res.setEncoding('utf8');
        var rawData = "";
        res.on('data', (chunk) => rawData += chunk);
        res.on('end', () => {
            try {
                rawData = removeSingleQuotes(rawData);
                save(rawData);
            } catch (e) {
                console.log(e.message);
            }
        });
    }).on('error', (e) => {
        console.log(`Got error: ${e.message}`);
    });
}

setInterval(repeatingRequest, 5000);

function removeSingleQuotes(text){
    return text.replace(/'/g, "");
}

function save(data){
    connection.query('INSERT INTO JsonTable (jsonData) VALUES (\'' + data + '\')', function (err, rows, fields) {
        console.log(data);
    });
}

// sendSms = require('./send_sms.js');

module.exports = app;