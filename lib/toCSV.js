/*
* This files contains method for each vote mode to export the database to a csv
*/

var _ = require('lodash'),
    csv = require("fast-csv");

exports.prefCSV = function(data,writeStream){

  var parser = csv.createWriteStream({headers:true});
  parser.pipe(writeStream);
  
  var transformRow = function(ballot){
    var row = {};
    
    _.forEach(ballot.prefList,function(label,index){
      row['pref'+index] = label;
    })

    row['number'] = ballot.number;
    return row;
  }

  _.forEach(data,function(ballot){
    parser.write(transformRow(ballot))
  })

  parser.end();
  
}

exports.jugCSV = function(data,writeStream){

  var parser = csv.createWriteStream({headers:true});
  parser.pipe(writeStream);  
  var transformRow = function(ballot){
    var row = {};
    
    _.forEach(ballot.candMention,function(mention,candLabel){
      row[candLabel] = mention;
    })

    row['number'] = ballot.number;
    return row;
  }

  _.forEach(data,function(ballot){
    parser.write(transformRow(ballot))
  })

  parser.end();
}
