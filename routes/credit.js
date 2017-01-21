var express = require('express');
var router = express.Router();

var Election = require("../models/elections");

router.use(function(req,res,next){
  res.locals.pageName = "credit";
  next();
})

/* GET credit. */
router.get('/', function(req, res, next) {

  var E = Election.get();
  var elections = Election.getAll();
  
  res.render('credit', { title: 'Crédit',
			 "elections": elections,
			 "electionId" : E.id
		       });
});

module.exports = router;
