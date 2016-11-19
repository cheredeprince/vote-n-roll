var express = require('express'),
    _       = require('lodash'),
    Votes   = require('../models/votes'),
    Candidats = require('../models/candidats'),
    Config   = require('../config'),
    Data      = require('../lib/data');
var router = express.Router();

/* GET les resultats. */
router.get('/', function(req, res, next) {
  //s'il y a un message à afficher
  var message = req.query.message,
      results = Votes.getResults(),
      info = { "message" : message,
               "scrutins": {}
             };

    _.forEach(Config.scrutins,function(scrutin,label){
      info.scrutins[label] = {
        "title" : scrutin.name,
        "data"  : Data[scrutin.getData](results[label]),
        "display": scrutin.display
      };
    });

  
  var totalScore = _.map(results,function(scrRes,label){
    var r = _.clone(scrRes.ranked);
    r = _.mapKeys(r,(v,lab) => Candidats.getNameOf(lab))
    r.category = Config.scrutins[label].name;
    return r;
  });

  info.total = totalScore;

  res.render('results', info);
});

module.exports = router;



