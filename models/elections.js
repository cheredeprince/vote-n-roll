var _ = require("lodash");

var config = require('../config');
var Candidats = require("./candidats").Candidats;

var Election = function(id,data,scrutinsConf){

  this.Candidats = new Candidats(data.candidats);
  this.name = data.name;
  this.id = id;
  var scrutins = _.reduce(data.scrutins,function(res,scrutin){
    res[scrutin] = scrutinsConf[scrutin];
    res[scrutin].id = scrutin;
    return res;
  },{});
  this.scrutins = scrutins;
  this.voteModes = _.uniq(_.map(scrutins,(s) => s.voteMode))
}

exports.get = function(electionId){
  //sans argument rend la dernière élection
  electionId = (!electionId)?Object.keys(config.elections)[0]:electionId; 
  if(config.elections[electionId])
    return new Election(electionId,config.elections[electionId],_.cloneDeep(config.scrutins));
  else
    return undefined;
};


exports.getAll =function(){
  return _.map(Object.keys(config.elections),(e) => this.get(e));
}
