var express = require('express');
var router = express.Router();

/* GET credit. */
router.get('/', function(req, res, next) {
  res.render('credit', { title: 'Crédit'});
});

module.exports = router;
