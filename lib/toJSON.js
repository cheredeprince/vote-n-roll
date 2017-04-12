var _ = require("lodash");

exports.prefJSON = function(ballots){
  return _.map(ballots, function(b){
    return {
      "number" : b.number,
      "prefList" : b.prefList
    }
    
  })
}

exports.jugJSON = function(ballots){
 return  _.map(ballots,function(b){

    return {
      "number": b.number,
      "candMention" : b.candMention
    };
  })
}

