var express = require('express'),
    _       = require('lodash'),
    Candidats = require('../models/candidats'),
    Config   = require('../config'),
    Data      = require('../lib/data');
var VoteBox = require('../models/voteBox');
var ResultsBoard = require('../models/resultsBoard');

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
  
   var tmpVMI = {};

  _.forEach(Config.scrutins,function(scrutin,label){

    if(! tmpVMI[scrutin.voteMode])
      tmpVMI[scrutin.voteMode] = {
	"scrutins": [],
	"name": Config.voteModes[scrutin.voteMode].name,
	"nbVotes": VoteBox.getCountOf(scrutin.voteMode)
      };
      
    
    tmpVMI[scrutin.voteMode].scrutins.push({
      "label" : label,
      "name"  : scrutin.name,
      "data"  : Data[scrutin.getData](ResultsBoard.get(label)),
      "display": scrutin.display,
      "chartTitle" : scrutin.chartTitle,
      "presentation": scrutin.presentation
    })
    
    });

  console.log(tmpVMI);
  
  var totalScore = _.map(Config.scrutins,function(scrutin,label){
    var r = ResultsBoard.get(label).ranked;
    r = _.mapKeys(r,(v,lab) => Candidats.getNameOf(lab))
    r.category = scrutin.name;
    return r;
  });


   var info = { "title" : "Les résultats",
		"message" : message,
		"colors" :  Candidats.getColorsByCandName(),
               "voteModesInfo": _.map(tmpVMI,(VM) =>VM),
	       "voteModeConf" : _.cloneDeep(Config.voteModes),
	       "candConf": _.cloneDeep(Config.candidats),
               "resultPage": true,
		"messageType" : "info",
		"total": totalScore
              };
  
  res.render('results', info);
});

module.exports = router;



