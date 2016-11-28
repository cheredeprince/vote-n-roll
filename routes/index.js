var express = require('express');
var router = express.Router();

router.use(function(req,res,next){
  res.locals.pageName = "index";
  next();
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Vote\'n roll' });
});

module.exports = router;
