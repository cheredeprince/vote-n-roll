xvar config = require('../config');

exports.labels = function(){
  return Object.keys(config.candidats);
} 

exports.getNameOf = function(label){
  if(config.candidats[label])
    return config.candidats[label].name;
  else
    return undefined;
};

exports.existsLabel = function(label){
  if(config.candidats[label])
    return true;
  else
    return false;
};
