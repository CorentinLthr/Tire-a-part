var path = require('path');
var express = require('express'); // npm install express
var logger = require('morgan'); // npm install morgan
var bodyParser = require('body-parser')// npm install bosy-parser
var http = require('http');

var getRecord = require('./getRecord.js');
var identify= require('./Identify.js');
var listSets = require('./ListSets.js');

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
  var verb;
  var identifier;
  var metadataPrefix;
  var host = req.get('host')
  if(req.method=='GET'){
    verb=req.query.verb;
    identifier=req.query.identifier;
    metadataPrefix=req.query.metadataPrefix;
  }else if(req.method=='POST'){
    verb=req.body.verb;
    identifier=req.body.identifier;
    metadataPrefix=req.body.metadataPrefix;
  }

  if (verb) {
    console.log('verb ok');
    if (verb === 'GetRecord') {
      getRecord(identifier,metadataPrefix,host,res);
    }else if(verb=='Identify'){
      identify(host,res);
    } else if(verb=='ListSets'){
      listSets(host,res);
    }else {
      res.send("pas GetRecord");
    }
  } else {
    res.send("no verb");
  }

}



app.post('/pmh', callback);
app.get('/pmh', callback);

// Route for everything else.
app.get('*', function(req, res) {
  res.send('Hello World');
});

app.listen(3000);
