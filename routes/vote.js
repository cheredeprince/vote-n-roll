/* vote.js */
/* controlleur pour les votes */

var express = require('express'),
    _       = require('lodash');
var router  = express.Router();
var escapeHTML = require('escape-html');

var Candidats = require('../models/candidats.js'),
    Config    = require('../config.js'),
    VoteBox   = require('../models/voteBox');
var resultsBoard = require('../models/resultsBoard')

router.use(function(req,res,next){
  res.locals.pageName = "vote";
  next();
})

/* GET formulaire de vote */
router.get('/', function(req, res, next) {
  var candLabel = Candidats.labels(),
      nameLab   = _.map(candLabel,
                        function(label){
                          return { "label" : label,
                                   "name"  : Candidats.getNameOf(label),
                                   "image" : Candidats.getImageOf(label)
                                 };
                        });

  var message,
      messageType,
      messageTo;

  //on récupère le message ou l'erreur
  if(req.query.message && req.query.to){
    message = escapeHTML(req.query.message);
    messageType = "info";
    messageTo = escapeHTML(req.query.to);
  }
  if(req.query.error){
    message = escapeHTML(req.query.error);
    messageType = "error";
    messageTo = escapeHTML(req.query.to);
  }

  //liste des bulletins que l'on veut recueillir avec leurs paramètres
   var ballotsList = _.map(_.cloneDeep(Config.voteModes),(config) => config)
  
  res.render('vote',{
    "title"   : 'Votes',
    "nameLab" : _.shuffle(nameLab),
    "message" : message,
    "messageType": messageType,
    "messageTo" : messageTo,
    "ballotsList": ballotsList
  });
});

/* POST vote pref */
router.post('/ajout/pref', function(req, res, next){

  var candLabel = Candidats.labels();
  var params    = req.body,
      labelList = [];

  for(index in candLabel){
    var i = parseInt(params[candLabel[index]],10);
    labelList[i] = candLabel[index];
  }

  VoteBox.addTo("pref",labelList,function(err){
    if(err){
      if(err =="invalid"){
	var message = encodeURIComponent("Vote invalide, pensez à classer TOUS les candidats");
	res.redirect('/vote?error='+message+'&to=pref#pref');
      }else
	return next(err);
    }else{
      //mise à jour des résultats
      VoteBox.getFrom("pref",function(err,ballots){
	resultsBoard.update("pref",ballots);
      })
      
      var message = encodeURIComponent("Votre vote pour le vote alternatif a été pris en compte. Vous pouvez voter pour le jugement majoritaire à présent.");
      res.redirect('/vote?message='+message+'&to=jug#jug');
    }
  });
})

/* POST vote jug */
router.post('/ajout/jug', function(req, res, next){

  var candLabel = Candidats.labels();
  var params    = req.body,
      jugPerCand= {};

  for(index in candLabel){
    jugPerCand[candLabel[index]] = params["jug-"+candLabel[index]];
  }

  
  VoteBox.addTo("jug",jugPerCand,function(err){
    if(err){
      if(err =="invalid"){
	var message = encodeURIComponent("Vote invalide, pensez à juger TOUS les candidats");
	res.redirect('/vote?error='+message+'&to=jug#jug');
      }else
	return next(err);
    }else{
      //mise à jour des résultats
      VoteBox.getFrom("jug",function(err,ballots){
	resultsBoard.update("jug",ballots);

      })
      
      var message = encodeURIComponent("Votre vote par jugement a été pris en compte.");
      res.redirect('/resultats?message='+message);
      
    }
  });
})

module.exports = router;


















