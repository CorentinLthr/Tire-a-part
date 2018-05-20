var path = require('path');
var express = require('express'); // npm install express
var logger = require('morgan'); // npm install morgan
var bodyParser = require('body-parser')// npm install bosy-parser
var http = require('http');
var getRecord_Get = require('./getRecord_Get.js');

var app = express();

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));


// Log the requests
app.use(logger('dev'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

function callback(req, res) {
  if (req.query.verb) {
    console.log('verb ok');
    if (req.query.verb === 'GetRecord') {
      getRecord_Get(req,res);
    } else {
      res.send("pas get GetRecord");
    }
  } else {
    res.send("no verb");
  }

}

function Postcallback(req, res) {
  if (req.body.verb) {
    res.send("verb ok");
  } else {
    res.send("no verb");
  }

}


app.post('/pmh', Postcallback);
app.get('/pmh', callback);

// Route for everything else.
app.get('*', function(req, res) {
  res.send('Hello World');
});

app.listen(3000);
