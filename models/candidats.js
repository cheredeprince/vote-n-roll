var config = require('../config'),
    _      = require('lodash');


// var colorsByCandName = _.reduce(Object.keys(config.candidats),
// 				function(res,label){
// 				  res[config.candidats[label].name] =
// 				    config.candidats[label].color;
// 				  return res;
// 				},{});


// exports.labels = function(){
//   return Object.keys(config.candidats);
// } 

// exports.getNameOf = function(label){
//   if(config.candidats[label])
//     return config.candidats[label].name;
//   else
//     return undefined;
// };

// exports.getImageOf = function(label){
//   if(config.candidats[label])
//     return config.candidats[label].image;
//   else
//     return undefined;
// };

// exports.getColorOf = function(label){
//   if(config.candidats[label])
//     return config.candidats[label].color;
//   else
//     return undefined;
// };

// exports.existsLabel = function(label){
//   if(config.candidats[label])
//     return true;
//   else
//     return false;
// };

// exports.getColorsByCandName = function(){
//   return _.clone(colorsByCandName);
// }

exports.Candidats = function(data){

  var colorsByCandName = _.reduce(Object.keys(data),
				  function(res,label){
				    res[data[label].name] =
				      data[label].color;
				    return res;
				  },{});


  for(var label in data){
    this[label] = _.cloneDeep(data[label]);
    this[label].label = label;
  }


  this.labels = function(){
    return Object.keys(data);
  } 

  this.labels = Object.keys(data);
  
  this.getNameOf = function(label){
    if(data[label])
      return data[label].name;
    else
      return undefined;
  };

  

  this.getImageOf = function(label){
    if(data[label])
      return data[label].image;
    else
      return undefined;
  };

  this.getColorOf = function(label){
    if(data[label])
      return data[label].color;
    else
      return undefined;
  };

  this.existsLabel = function(label){
    if(datal[label])
      return true;
    else
      return false;
  };

  this.getColorsByCandName = function(){
    return _.clone(colorsByCandName);
  }

  this.getData = function(){
    return _.cloneDeep(data);
  }
}
