var config = require('../config'),
    _      = require('lodash');


var colorsByCandName = _.reduce(Object.keys(config.candidats),
			    function(res,label){
			      res[config.candidats[label].name] =
				config.candidats[label].color;
			      return res;
			    },{});


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

exports.getColorsByCandName = function(){
  return _.clone(colorsByCandName);
}
