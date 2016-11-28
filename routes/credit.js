var express = require('express');
var router = express.Router();

router.use(function(req,res,next){
  res.locals.pageName = "credit";
  next();
})

/* GET credit. */
router.get('/', function(req, res, next) {
  res.render('credit', { title: 'Crédit'});
});

module.exports = router;
