/*
 * This file contains the parser of post data after a vote mode
 */

exports.votePref = function(params,candLabel){
  data = [];
  for(index in candLabel ){
    var i = parseInt(params[candLabel[index]],10);
    data[i] = candLabel[index];
  }

  return data;
}

exports.voteJug = function(params,candLabel){
  data = {};
  for(index in candLabel){
    data[candLabel[index]] = params["jug-"+candLabel[index]];
  }

  return data;
}
