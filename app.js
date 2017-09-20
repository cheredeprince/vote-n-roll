var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require("lodash");
var fs = require("fs");
var compression = require("compression");

var index = require('./routes/index');
var vote  = require('./routes/vote');
var results  = require('./routes/results');
var credit  = require('./routes/credit');
var data  = require('./routes/data');

var config = require('./config');
var voteBox = require('./models/voteBox');
var resultsBoard = require('./models/resultsBoard');

//Models initialisation

var voteModePerElection = _.reduce(config.elections,function(res,election,id){
  var voteMode = _.flatMap(election.scrutins,(s) => config.scrutins[s].voteMode);
  res[id] = _.uniq(voteMode);
  return res;
},{});

voteBox.init(voteModePerElection);

var length = _.sum(_.map(voteModePerElection,(a) => a.length));
var k = 0;
var res = {};

_.forEach(config.elections,function(election,id){
  res[id] = {};
  voteModePerElection[id].forEach(function(modeVote){
    voteBox.getFrom(id,modeVote,function(err, ballots){
      //create csv of results
      var ws = fs.createWriteStream(__dirname+"/public/data/votes-"+id+"-"+modeVote+".csv");
      require('./lib/toCSV')[config.voteModes[modeVote].toCSV](ballots,ws);

      k++;
      res[id][modeVote] = ballots;
    });
})
})




var app = express();

app.set('config',config);
app.set('trust proxy','loopback');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(compression());
app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/vote',vote);
app.use('/resultats',results);
app.use('/credit',credit);
app.use('/data',data);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
