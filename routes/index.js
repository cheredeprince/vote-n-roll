var express = require('express');
var router = express.Router();

var Election = require("../models/elections");

router.use(function(req,res,next){
  
  res.locals.pageName = "index";
  next();
})

/* GET home page. */
router.get('/', function(req, res, next) {

  var E = Election.get();
  var elections = Election.getAll();
  
  res.render('index', { "title": 'Vote\'n roll',
			"electionId": E.id,
			"elections" : elections
		      });
});

module.exports = router;
