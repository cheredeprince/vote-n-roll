var Datastore = require('nedb');
var _         = require('lodash');

var Candidats = require('./candidats');
var ballots = require('../lib/ballot');

var dbs = {};
var Ballots = {};
var ballotsNbPerMode = {};

/*
  * Les votes sont enregistrés ainsi des boîtes :
  * - un mode de vote (qui doit être correct)
  * - la donnée du bulletin de vote
  * s'occupe de ne pas dédoubler les votes indentique,
  * grâce à un compteur : number
*/

exports.addTo = function(voteMode,data,next){

  // on initialise le bulletin à avec la liste de candidats
  var ballot = new Ballots[voteMode](Candidats.labels());
  // on inscrit les données du vote sur le bulletin
  ballot.set(data, function(err){
    if(err) return next("invalid");

    var ballotData = ballot.get();

    // on teste s'il le vote est le premier
    dbs[voteMode].find({"label":ballotData.label},{_id:1},function(err,docs){
      if(err) return next(err);

      if(docs.length == 0){
	ballotData.number = 1;
	dbs[voteMode].insert(ballotData,function(err,doc){
	  if(err) return next(err);
	  next(null,doc);
	  ballotsNbPerMode[voteMode]++;
	})
      }else{
	dbs[voteMode].update({"label":ballotData.label},{$inc:{"number":1}},function(err,nb){
	  if(err) return next(err);
	  next(null,ballotData);
	  ballotsNbPerMode[voteMode]++;
	})
      }
    })
  })
};

/*
  * Méthode pour récupérer les votes bruts 
  * d'une boîte 
  *
*/
exports.getFrom = function(voteMode,next){
  dbs[voteMode].find({},{_id:0},function(err,docs){
    if(err) return next(err);
    next(null,docs);
  })
};

exports.getCountOf = function(voteMode){
    console.log(ballotsNbPerMode);
  return ballotsNbPerMode[voteMode];
}

exports.init = function(voteModesList){
  voteModesList.forEach(function(voteMode){
    dbs[voteMode] = new Datastore({ filename: __dirname+'/../db/votes-'+voteMode,autoload:true});
    Ballots[voteMode] = ballots[voteMode];
    dbs[voteMode].count({},function(err,count){
      if(err) throw err;
      ballotsNbPerMode[voteMode] = count;
    })
  })
};
