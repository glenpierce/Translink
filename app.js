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

app.use('/', index);
app.use('/users', users);

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

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : process.argv[2],
    database : 'translink'
});

var options = {
    host: 'api.translink.ca',
    path: '/rttiapi/v1/buses?apikey=' + process.argv[3],
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

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
            //var parsedData = JSON.parse(rawData);
            rawData = removeSingleQuotes(rawData);
            save(rawData);
        } catch (e) {
            console.log(e.message);
        }
    });
    }).on('error', (e) => {
        console.log(`Got error: ${e.message}`);
});

function removeSingleQuotes(text){
    return text.replace(/'/g, "");
}

function save(data){
    connection.connect();

    connection.query('INSERT INTO JsonTable (jsonData) VALUES (\'' + data + '\')', function (err, rows, fields) {
        console.log(data);
    });
}

module.exports = app;
