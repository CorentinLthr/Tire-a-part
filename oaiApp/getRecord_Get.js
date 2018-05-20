var http = require('http');

module.exports = function(req, res) {
  var xmldoc;
  console.log('verb GetRecord');
  if (!req.query.identifier) {
    xmldoc=badArgument(req);
    res.set('Content-Type', 'application/xml');
    res.send(xmldoc);
  }else{
    console.log('identifier ok');
    if (!req.query.metadataPrefix) {
      xmldoc=badArgument(req);
      res.set('Content-Type', 'application/xml');
      res.send(xmldoc);
    }else{
      console.log('metadataprefix ok');
      if (!req.query.metadataPrefix === 'oai_dc') {
        xmldoc = xmlBase(req);
        xmldoc += '<error code="cannotDisseminateFormat">oai_dc is the only supported format</error>';
        res.set('Content-Type', 'application/xml');
        res.send(xmldoc);
      } else {
        console.log('oai_dc ok');

        //we query the doc with the couchdb api
        var deb = http.get('http://127.0.0.1:5984/tire-a-part/' + req.query.identifier, (resp) => {
          let data = '';

          // A chunk of data has been recieved.
          resp.on('data', (chunk) => {
            data += chunk;
          });

          // The whole response has been received
          resp.on('end', () => {

            // we receive the couchdb doc and parse it to an object
            var couchDBdoc = JSON.parse(data);
            //we check if the doc exist, if it doeasnt we send an error message

            if (couchDBdoc.error) {
              xmldoc = xmlBase(req);
              xmldoc += '<error code="idDoesNotExist">No matching identifier</error>';
              xmldoc += '</OAI-PMH>';
              res.set('Content-Type', 'application/xml');
              res.send(xmldoc);
            } else {
              // if there are no error


              //we make a new objet that contain the desired information
              //and is structured so it can be parsed to xml
              //var doc = {"OAI-PMH":[{_attr:{xmlns="http://www.openarchives.org/OAI/2.0/" }}]}

              //the xml is made
              xmldoc = xmlBase(req);
              //checker si il fau l'uri du doc ou l'id dans couchdb
              xmldoc += '<GetRecord> <record> <header> <identifier>' + req.query.identifier + '</identifier>';
              //ici on est censé mettr la date de dernière modif ou creation, on a pas cadans couchdb ???
              // donc on met la date du doc ?
              var tmst;
              if (couchDBdoc.timestamp) {
                tmsp = couchDBdoc.timestamp;
                //si on a aps de time stanp on met le 1 janvier de la date du doc
              } else {
                tmsp = new Date(couchDBdoc['DC.issued'], 1, 1).toISOString();
              }
              xmldoc += '<datestamp>' + tmsp + '</datestamp>';
              xmldoc += '</header>';
              xmldoc += '<metadata>';
              xmldoc += '<oai_dc:dc  xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" ';
              xmldoc += 'xmlns:dc="http://purl.org/dc/elements/1.1/" ';
              xmldoc += 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ';
              xmldoc += ' xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ ';
              xmldoc += 'http://www.openarchives.org/OAI/2.0/oai_dc.xsd">';


              //on ajoute les metadonne en dublin core
              xmldoc += '<dc:title>' + couchDBdoc['DC.title'] + '</dc:title>';
              for (var i = 0; i < couchDBdoc['DC.creator'].length; i++) {
                xmldoc += '<dc:creator>' + couchDBdoc['DC.creator'][i] + '</dc:creator>';
              }
              if (couchDBdoc.abstract) {
                xmldoc += '<dc:description>' + couchDBdoc.abstract + '</dc:description>';
              }
              if (couchDBdoc['DC.issued']) {
                xmldoc += '<dc:date>' + couchDBdoc['DC.issued'] + '</dc:date>';
              }
              if (couchDBdoc['DC.publisher']) {
                xmldoc += '<dc:publisher>' + couchDBdoc['DC.publisher'] + '</dc:publisher>';
              }
              if (couchDBdoc._attachments) {
                xmldoc += '<dc:identifier>http://publications.icd.utt.fr/' + couchDBdoc._id + '/' + Object.keys(couchDBdoc._attachments) + '</dc:identifier>';
                xmldoc += '<dc:format>pdf</dc:format>';
              }
              xmldoc += '</oai_dc:dc></metadata></record></GetRecord></OAI-PMH>';


              console.log("doc: " + couchDBdoc);
              console.log("return: " + deb);
              //  doc = js2xmlparser.parse(doc);
              res.set('Content-Type', 'application/xml');
              res.send(xmldoc);
            }
          });
        });
      }
    }
  }
}

function xmlBase(req) {

  var xmldoc = '<?xml version="1.0" encoding="UTF-8"?>';
  xmldoc += '<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/" ';
  xmldoc += 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ';
  // CHECKER ICI LES URI, FAIRE GAFFE AUX ESPACES
  xmldoc += 'xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/ ';
  xmldoc += 'http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd">';
  var date = new Date().toISOString();

  xmldoc += '<responseDate>' + date + '</responseDate>';
  xmldoc += '<request verb="GetRecord" identifier="' + req.query.identifier + '" ';
  //req.get('host') A VERIFIER, PA SUR
  xmldoc += 'metadataPrefix="' + req.query.metadataPrefix + '">' + req.get('host') + '</request>';
  return xmldoc;
}


function badArgument(req){
  var xmldoc = xmlBase(req);
  var xmldoc+='<error code="badArgument">need every required parameters</error>';
}
