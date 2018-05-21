function(doc) {
    if(doc.timestamp){
       emit(doc.timestamp, doc.timestamp);
    }else if(doc['DC.issued']){
      emit(doc['DC.issued'],doc['DC.issued']);
    }
}
