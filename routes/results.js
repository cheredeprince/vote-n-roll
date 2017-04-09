var express = require('express'),
    _       = require('lodash'),
    Candidats = require('../models/candidats'),
    Config   = require('../config'),
    Data      = require('../lib/data');
var Election = require('../models/elections');
var VoteBox = require('../models/voteBox');
var ResultsBoard = require('../models/resultsBoard');

var escapeHTML = require('escape-html');
var router = express.Router();


router.use(function(req,res,next){
  res.locals.pageName = "results";
  next();
})

/* GET les resultats. */
router.get('/:electionId', function(req, res, next) {

  setTimeout(function(){
  
  //s'il y a un message à afficher
  var message = (req.query.message)?escapeHTML(req.query.message): undefined;
  var electionId = req.params.electionId;

  var E = Election.get(electionId);
  console.log(E)
  if(typeof E == 'undefined'){
    res.status(404);
    res.send('404: Page not Found');
    return;
  }
  
  var tmpVMI = {};

  _.forEach(E.scrutins,function(scrutin,label){

    if(! tmpVMI[scrutin.voteMode])
      tmpVMI[scrutin.voteMode] = {
	"scrutins": [],
	"name": Config.voteModes[scrutin.voteMode].name,
	"nbVotes": VoteBox.getCountOf(E.id,scrutin.voteMode)
      };
    
    tmpVMI[scrutin.voteMode].scrutins.push({
      "label" : label,
      "name"  : scrutin.name,
      "chartTitle" : scrutin.chartTitle,
      "presentation": scrutin.presentation
    })
    
  });
  
  var totalScore = _.map(E.scrutins,function(scrutin){
    var r = ResultsBoard.get(E.id,scrutin.id).ranked;
    r = _.mapKeys(r,(v,lab) => E.Candidats.getNameOf(lab))
    r.category = scrutin.name;
    return r;
  });

  var elections = Election.getAll();

  console.log("elections",E.Candidats)
  
  var info = { "title" : "Les résultats de "+E.name,
	       "electionName" : E.name,
	       "electionId": E.id,
	       "election" : E,
	       "elections" : elections,
	       "message" : message,
	       "colors" :  E.Candidats.getColorsByCandName(),
	       "voteModesInfo": _.map(tmpVMI,(VM) =>VM),
	       "voteModeConf" : _.cloneDeep(Config.voteModes),
	       "candConf": E.Candidats.getData(),
	       "resultPage": true,
	       "messageType" : "info"
             };
  
  res.render('results', info);
  },600)  
});

module.exports = router;
