var Datastore = require('nedb');
var _         = require('lodash');

var ballots = require('../lib/ballot');

var dbs = {};
var Ballots = {};
var ballotsCount = {};

/*
  * Les votes sont enregistrés ainsi des boîtes :
  * - une election
  * - un mode de vote (qui doit être correct)
  * - la donnée du bulletin de vote
  * s'occupe de ne pas dédoubler les votes indentique,
  * grâce à un compteur : number
*/

exports.addTo = function(election,voteMode,data,candLabel,next){
  // on initialise le bulletin à avec la liste de candidats
  var ballot = new Ballots[voteMode](candLabel,election);
  // on inscrit les données du vote sur le bulletin
  ballot.set(data, function(err){
    if(err) return next("invalid");

    var ballotData = ballot.get();

    // on teste s'il le vote est le premier
    dbs[election][voteMode].find({"label":ballotData.label},{_id:1},function(err,docs){
      if(err) return next(err);

      if(docs.length == 0){
	ballotData.number = 1;
	dbs[election][voteMode].insert(ballotData,function(err,doc){
	  if(err) return next(err);
	  next(null,doc);
	  ballotsCount[election][voteMode]++;
	})
      }else{
	dbs[election][voteMode].update({"label":ballotData.label},{$inc:{"number":1}},function(err,nb){
	  if(err) return next(err);
	  next(null,ballotData);
	  ballotsCount[election][voteMode]++;
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

exports.getFrom = function(election,voteMode,next){
  dbs[election][voteMode].find({},{_id:0},function(err,docs){
    if(err) return next(err);
    next(null,docs);
  })
};

exports.getCountOf = function(election,voteMode){
  return ballotsCount[election][voteMode];
}

exports.init = function(voteModePerElection){
  _.forEach(voteModePerElection,function(v,election){
    dbs[election] = {};
    ballotsCount[election] = {};

    voteModePerElection[election].forEach(function(voteMode){
      dbs[election][voteMode] = new Datastore({ filename: __dirname+'/../db/votes-'+election+'-'+voteMode, autoload:true});

      Ballots[voteMode] = ballots[voteMode];

      dbs[election][voteMode].find({},function(err,votes){
	if(err) throw err;
	ballotsCount[election][voteMode] = _.reduce(votes,(res,v) => res+v.number,0);
      })

    })
  })
};
