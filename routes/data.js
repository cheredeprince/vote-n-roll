var express = require('express');
var router = express.Router();

var _ = require('lodash');

var Election = require("../models/elections");

router.use(function(req,res,next){
  res.locals.pageName = "données";
  next();
})

/* GET credit. */
router.get('/', function(req, res, next) {

  var E = Election.get();
  var elections = Election.getAll();
  console.log(E)
  var voteModeByElec = _.map(elections,(e) => _.uniq(_.map(e.scrutins, (s) => s.voteMode)))

//  console.log(voteModeByElec)
  
  res.render('data', { title: 'Crédit',
		       "elections": elections,
		       "electionId" : E.id,
		       "voteModeByElec": voteModeByElec
		       });
});

module.exports = router;
