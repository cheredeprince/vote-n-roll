var config = require('../config');

exports.labels = function(){
  return Object.keys(config.candidats);
} 

exports.getNameOf = function(label){
  if(config.candidats[label])
    return config.candidats[label].name;
  else
    return undefined;
};

exports.getImageOf = function(label){
  if(config.candidats[label])
    return config.candidats[label].image;
  else
    return undefined;
};

exports.getColorOf = function(label){
  if(config.candidats[label])
    return config.candidats[label].color;
  else
    return undefined;
};

exports.existsLabel = function(label){
  if(config.candidats[label])
    return true;
  else
    return false;
};
