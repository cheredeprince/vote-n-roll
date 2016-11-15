var express = require('express');
var router = express.Router();

/* GET les resultats. */
router.get('/', function(req, res, next) {
  //s'il y a un message à afficher
  var message = req.query.message;
  
  res.render('results', { message: message });
});

module.exports = router;
