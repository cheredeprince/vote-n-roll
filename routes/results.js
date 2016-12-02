var express = require('express'),
    _       = require('lodash'),
    Votes   = require('../models/votes'),
    Candidats = require('../models/candidats'),
    Config   = require('../config'),
    Data      = require('../lib/data');
var escapeHTML = require('escape-html');
var router = express.Router();


router.use(function(req,res,next){
  res.locals.pageName = "results";
  next();
})

/* GET les resultats. */
router.get('/', function(req, res, next) {
  //s'il y a un message à afficher
  var message = (req.query.message)?escapeHTML(req.query.message): undefined;
  
  var results = Votes.getResults(),
      info = { "title" : "Les résultats",
               "message" : message,
               "scrutins": [],
               "nbVotes": Votes.getNbVotes(),
               "resultPage": true,
               "messageType" : "info"
             };

    _.forEach(Config.scrutins,function(scrutin,label){
      info.scrutins.push({
        "label" : label,
        "name"  : scrutin.name,
        "data"  : Data[scrutin.getData](results[label]),
        "display": scrutin.display,
        "chartTitle" : scrutin.chartTitle,
        "presentation": scrutin.presentation
      });
    });
  
  var totalScore = _.map(results,function(scrRes,label){
    var r = _.clone(scrRes.ranked);
    r = _.mapKeys(r,(v,lab) => Candidats.getNameOf(lab))
    r.category = Config.scrutins[label].name;
    return r;
  });

  info.total = totalScore;

  info.colors = Candidats.getColorsByCandName();
  
  res.render('results', info);
});

module.exports = router;



