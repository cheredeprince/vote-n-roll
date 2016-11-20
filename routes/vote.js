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
      nameLab   = _.map(candLabel,
                        function(label){
                          return { "label" : label,
                                   "name"  : Candidats.getNameOf(label),
                                   "image" : Candidats.getImageOf(label)
                                 };
                        });
  
  res.render('vote',{
    "title"   : 'Votes',
    "nameLab" : _.shuffle(nameLab)
  });
});

/* POST un vote */
router.post('/ajout', function(req, res, next){
  console.log(req.body)

  var candLabel = Candidats.labels();
  var params    = req.body,
      labelList = [];

  for(index in candLabel){
    var i = parseInt(params[candLabel[index]],10);
    labelList[i] = candLabel[index];
  }

  console.log(labelList)
  Votes.add(labelList,function(err){
    if(err) return next(err);
    var message = encodeURIComponent("Votre vote a été pris en compte.");
    res.redirect('/resultats?message='+message);
  });
})

module.exports = router;


















