/* vote.js */
/* controlleur pour les votes */

var express = require('express'),
    _       = require('lodash');
var router  = express.Router();

var Votes     = require('../models/votes.js'),
    Candidats = require('../models/candidats.js');

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
  var message = req.query.message;

  console.log("ok"+message)
  
  res.render('vote',{
    "title"   : 'Votes',
    "nameLab" : _.shuffle(nameLab),
    "message" : message,
    "messageType": "error"
  });
});

/* POST un vote */
router.post('/ajout', function(req, res, next){

  var candLabel = Candidats.labels();
  var params    = req.body,
      labelList = [];

  for(index in candLabel){
    var i = parseInt(params[candLabel[index]],10);
    labelList[i] = candLabel[index];
  }

  Votes.add(labelList,function(err){
    if(err){
      if(err =="invalid"){
	var message = encodeURIComponent("Vote invalide, pensez à classer TOUS les candidats");
	res.redirect('/vote?message='+message);
      }else
	return next(err);
    }else{
      var message = encodeURIComponent("Votre vote a été pris en compte.");
      res.redirect('/resultats?message='+message);
    }
  });
})

module.exports = router;


















