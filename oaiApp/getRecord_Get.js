var http = require('http');

module.exports = function(req, res) {
  console.log('verb GetRecord');
  if (req.query.identifier) {
    console.log('identifier ok');
    if (req.query.metadataPrefix) {
      console.log('metadatprefix ok');
      if (req.query.metadataPrefix === 'oai_dc') {
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


            //we make a new objet that contain the desired information
            //and is structured so it can be parsed to xml
            //var doc = {"OAI-PMH":[{_attr:{xmlns="http://www.openarchives.org/OAI/2.0/" }}]}

            //the xml is made
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
            xmldoc += 'metadatPrefix="oai_dc">' + req.get('host') + '</request>';
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
              xmldoc += '<dc:creator>' +couchDBdoc['DC.creator'][i] + '</dc:creator>';
            }
            if(couchDBdoc.abstract){
              xmldoc+= '<dc:description>'+couchDBdoc.abstract+'</dc:description>';
            }
            if(couchDBdoc['DC.issued']){
              xmldoc+= '<dc:date>'+couchDBdoc['DC.issued']+'</dc:date>';
            }
            if(couchDBdoc['DC.publisher']){
              xmldoc+='<dc:publisher>'+couchDBdoc['DC.publisher']+'</dc:publisher>';
            }
            if(couchDBdoc._attachments){
            xmldoc+=  '<dc:identifier>http://publications.icd.utt.fr/'+couchDBdoc._id+'/'+Object.keys(couchDBdoc._attachments)+'</dc:identifier>';
            xmldoc+= '<dc:format>pdf</dc:format>';
            }
            xmldoc+='</oai_dc:dc></metadata></record></GetRecord></OAI-PMH>';


            console.log("doc: " + couchDBdoc);
            console.log("return: " + deb);
            //  doc = js2xmlparser.parse(doc);
            res.send(xmldoc);
          });

        }).on("error", (err) => {
          console.log("Error: " + err.message);
        });



      } else {
        res.send('no dc');
      }
    } else {
      res.send("no metadatprefix")
    }
  } else {
    res.send("no identifier");
  }
}
