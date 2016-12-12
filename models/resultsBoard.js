var _ = require('lodash');

var Scrutin = require('../lib/scrutin');

var resultsBoards = {};
var scrutinsPerElection = {};
var mkResPerscrutin = {};


exports.update = function(election,voteMode,ballots){
  scrutinsPerElection[election][voteMode].forEach(function(scrutin){    
    resultsBoards[election][scrutin] = mkResPerscrutin[scrutin](ballots);
  });
}

exports.get = function(election,scrutin){
  return _.cloneDeep(resultsBoards[election][scrutin]);
}

exports.init = function(electionsConf,scrutinsConf,ballotsPerElection){

  var allScrutins = _.uniq(_.flatMap(electionsConf,(c)=>c.scrutins));

  scrutinsPerElection = _.reduce(electionsConf,function(res,election,id){
    res[id] = _.reduce(election.scrutins,function(r,s){
      if(r[scrutinsConf[s].voteMode])
	r[scrutinsConf[s].voteMode].push(s);
      else
	r[scrutinsConf[s].voteMode] = [s];
      return r;
    },{})
    return res;
  },{})
  

  allScrutins.forEach(function(scrutin){
    mkResPerscrutin[scrutin] = Scrutin[scrutinsConf[scrutin].mkRes];
  })

  for(election in ballotsPerElection){
    resultsBoards[election] = {};
    for(voteMode in ballotsPerElection[election]){    
      this.update(election,voteMode,ballotsPerElection[election][voteMode]);
    }
  }
  
};
