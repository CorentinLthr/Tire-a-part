function(head, req) {
  // !code localization.js
  // !code lib/string.js
  // !code lib/record.js
  var Mustache = require("lib/mustache");

  start({
    headers: {"Content-Type": "text/html;charset=utf-8"}
  });


    var year =  '{"year":[';
    var current_year= (new Date()).getFullYear();
    var i;
    var first=1;

    for(i=1997;i<=current_year;i++){
      if(!first){
        year=year+',';
      }else{
        first=0;
      }
      year=year+'{"year":'+i+'}';
    }
    year=year+']}';
    year= JSON.parse(year);

    return Mustache.to_html(this.templates.google_accueil, year);
  }
