function(doc) {
    if(doc['DC.issued']){
    	if(doc._attachments){
     		 emit(doc['DC.issued'],doc);
  		}
    }
} 	
