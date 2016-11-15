/* vote.js */
/* controlleur pour les votes */

var express = require('express'),
    _       = require('lodash');
var router  = express.Router();

var Votes     = require('../models/votes.js'),
    Candidats = require('../models/candidats.js');
    
/* GET formulaire de vote */
router.get('/', function(req, res, next) {
  var candLabel = Candidats.labels(),
      candName  = _.map(candLabel,(label) => Candidats.getNameOf(label)),
      nameLab   = _.map(candLabel,(label) => [label,Candidats.getNameOf(label)]);
  
  res.render('vote',{
    "title"   : 'Votes',
    "nameLab" : nameLab
  });
});

/* POST un vote */
router.post('/ajout', function(req, res, next){
  console.log(req.body)
  var params    = req.body,
      i         = 0,
      labelList = [];

  while(params['item-'+i]){
    labelList[i] = params['item-'+i];
    i++;
  }

  Votes.add(labelList,function(err){
    if(err) return next(err);
    var message = encodeURIComponent("Votre vote a été pris en compte.");
    res.redirect('/resultats?message='+message);
  });
})

module.exports = router;


















