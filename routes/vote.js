/* vote.js */
/* controlleur pour les votes */

var express = require('express'),
    _       = require('lodash');
var router  = express.Router();
var fs      = require('fs');
var path    = require('path');
var escapeHTML = require('escape-html');

var Election = require('../models/elections');
var Candidats = require('../models/candidats.js'),
    Config    = require('../config.js'),
    voteMode  = _.cloneDeep(Config.voteModes),
    voteParser = require('../lib/postParser.js');
VoteBox   = require('../models/voteBox');
var resultsBoard = require('../models/resultsBoard')

router.use(function(req,res,next){
  res.locals.pageName = "vote";
  next();
})

/* GET formulaire de vote */
router.get('/:electionId', function(req, res, next) {

  var electionId = req.params.electionId; 
  var E = Election.get(electionId);

  if(typeof E == 'undefined'){
    res.status(404);
    res.send('404: Page not Found');
    return;
  }

  var candLabel = E.Candidats.labels(),
      nameLab   = _.map(candLabel,
                        function(label){
                          return { "label" : label,
                                   "name"  : E.Candidats.getNameOf(label),
                                   "image" : E.Candidats.getImageOf(label)
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
  var ballotsList = _.map(voteMode,(config) => config)
  var elections = Election.getAll();
  
  res.render('vote',{
    "title"   : 'Votes pour ' + E.name,
    "electionId" : electionId,
    "elections" : elections,
    "nameLab" : _.shuffle(nameLab),
    "message" : message,
    "messageType": messageType,
    "messageTo" : messageTo,
    "ballotsList": ballotsList
  });
});

router.post('/ajout/:electionId', function(req, res, next){

  var electionId = req.params.electionId;
  var E = Election.get(electionId);
    
  if(typeof E == 'undefined'){
    res.status(404);
    res.send('404: Page not Found');
    return;
  }

  var candLabel = E.Candidats.labels();
  var params    = req.body;
  var savedNb   = 0;
  var voteModeNB = Object.keys(E.voteModes).length; 


   // get specific data of the vote mode from the post data
    var datas = _.map(voteMode, (m,modelLabel)=> voteParser[m.postParser](params,candLabel));

    var vmLabels = Object.keys(voteMode);
    
    VoteBox.addTo(E.id,vmLabels,datas,candLabel,function(err,mlError){
	if(err){
	if(err =="invalid"){
	  var message = encodeURIComponent("Vote invalide, pensez à remplir tout le formulaire");
	  res.redirect('/vote/'+electionId+'?error='+message+'&to='+mlError+'#'+mlError);
	}else
	  return next(err);
	}else{
	    _.forEach(voteMode,function(m,modelLabel){
		//mise à jour des résultats
	VoteBox.getFrom(E.id,modelLabel,function(err,ballots){
	  resultsBoard.update(E.id,modelLabel,ballots);

	  //save csv of results
	  var ws = fs.createWriteStream(__dirname+"/../public/data/votes-"+electionId+"-"+modelLabel+".csv");
	  require('../lib/toCSV')[m.toCSV](ballots,ws);
	})
	
	    })

	  var message = encodeURIComponent("Vos votes ont été pris en compte. Vous pouvez à présent consulter les résultats.");
	  res.redirect('/resultats/'+electionId+'?message='+message);
	}
    
  })
})

router.get('/json/:electionId',function(req,res,next){
  
  var electionId = req.params.electionId;
  var E = Election.get(electionId);

   if(typeof E == 'undefined'){
     res.status(404);
     res.send('404: Page not Found');
     return;
   }
  
  res.setHeader('Content-Type', 'application/json');

  var allBallots = {};
  var voteModes = E.voteModes
  console.log(E.voteModes);
  grapBallot(0);

  function grapBallot(i){
    VoteBox.getFrom(E.id,voteModes[i],function(err,ballots){
      if(err) return next(err);

      allBallots[voteModes[i]] = ballots
      
      i++;
      if(voteModes.length == i)
	return send();
      else
	return grapBallot(i);
	
    }); 
  }

  function send(){
    res.send({a:1});
  }
  
})

// /* POST vote pref */
// router.post('/ajout/pref/:electionId', function(req, res, next){

  
//   var electionId = req.params.electionId;
//   var E = Election.get(electionId);

//   if(typeof E == 'undefined'){
//     res.status(404);
//     res.send('404: Page not Found');
//     return;
//   }

//   var candLabel = E.Candidats.labels();
//   var params    = req.body,
//       labelList = [];

//   for(index in candLabel){
//     var i = parseInt(params[candLabel[index]],10);
//     labelList[i] = candLabel[index];
//   }

//   VoteBox.addTo(E.id,"pref",labelList,candLabel,function(err){
//     if(err){
//       if(err =="invalid"){
// 	var message = encodeURIComponent("Vote invalide, pensez à classer TOUS les candidats");
// 	res.redirect('/vote/'+electionId+'?error='+message+'&to=pref#pref');
//       }else
// 	return next(err);
//     }else{
//       //mise à jour des résultats
//       VoteBox.getFrom(E.id,"pref",function(err,ballots){
// 	resultsBoard.update(E.id,"pref",ballots);
//       })
      
//       var message = encodeURIComponent("Votre vote pour le vote alternatif a été pris en compte. Vous pouvez voter pour le jugement majoritaire à présent.");
//       res.redirect('/vote/'+electionId+'?message='+message+'&to=jug#jug');
//     }
//   });
// })

// /* POST vote jug */
// router.post('/ajout/jug/:electionId', function(req, res, next){

//   var electionId = req.params.electionId;
//   var E = Election.get(electionId);

//   if(typeof E == 'undefined'){
//     res.status(404);
//     res.send('404: Page not Found');
//     return;
//   }

  
//   var candLabel = E.Candidats.labels();
//   var params    = req.body,
//       jugPerCand= {};

//   for(index in candLabel){
//     jugPerCand[candLabel[index]] = params["jug-"+candLabel[index]];
//   }

  
//   VoteBox.addTo(E.id,"jug",jugPerCand,candLabel,function(err){
//     if(err){
//       if(err =="invalid"){
// 	var message = encodeURIComponent("Vote invalide, pensez à juger TOUS les candidats");
// 	res.redirect('/vote/'+electionId+'?error='+message+'&to=jug#jug');
//       }else
// 	return next(err);
//     }else{
//       //mise à jour des résultats
//       VoteBox.getFrom(E.id,"jug",function(err,ballots){
// 	resultsBoard.update(E.id,"jug",ballots);
//       })
      
//       var message = encodeURIComponent("Votre vote par jugement a été pris en compte.");
//       res.redirect('/resultats/'+electionId+'?message='+message);
      
//     }
//   });
// })

module.exports = router;
