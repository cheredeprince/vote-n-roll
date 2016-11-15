var Datastore = require('nedb'),
    db        = new Datastore({ filename: '../db/votes', autoload: true }),
    _         = require('lodash');

var candidats = require('./candidats');

var results    = {},
    nbVotes    = 0;
/*
  * Les votes sont enregistrés ainsi :
  * - une liste de label de candidats triée par ordre de préférence
  * - un nombre de votes pour cette liste
*/


// incrémente le nombre de vote d'une certaine liste de préférence de label
var add = function(labelList,next){
  var candidatsLabels = candidats.labels(),
      interLabels = _.intersection(labelList,candidatsLabels),
      voteLabel;

  //si tous les labels existent et qu'aucun n'est en double
  //et la liste contient tous les candidats.
  if(interLabels.length == candidatsLabels.length
     && labelList.length == candidatsLabels.length){
    //construction du label de vote et inscription du nouveau vote.
    voteLabel = labelList.join('-');

    db.update({vote:voteLabel},
              {$inc: {number: 1}},
              {upsert: true}, function(err,nb,upsert){
                if(err) return next(err);
                //si on a fait une insertion, on précise la liste des labels
                // des candidats
                if(upsert)
                  db.update({vote:voteLabel},{$set:{list:labelList}},function(err){
                    if(err) return next(err);
                    updateResults(labelList,function(){
                      next(null,upsert);
                    })
                  })
                else
                  updateResults(labelList,function(){
                    next(null);
                  })
              })
  }else
    return next(true);
};

var getFirstRes = function(){
  return {
    "ranked" : _.clone(results.first.ranked),
    "scores" : _.clone(results.first.scores)
  };
};

/*------------------- Results Update -------------------*/

var updateFirst = function(labelList,next){
  var candidatsLabels = candidats.labels();

  var voteLabel = labelList[0],
      first     = results.first;
  
  first.scores[voteLabel] ++;
  first.ranked = _.sortBy(candidatsLabels,(label) => - results.first.scores[label]);
  next();
};

var updateResults = function(labelList,next){
  updateFirst(labelList,next);
};


/*------------------- Results Init -------------------*/

var initResults = function(){
  db.find({},{number:1,list:1},function(err,votes){
    if(err) throw err;
    console.log(err,votes);
    var candidatsLabels = candidats.labels();

    //le premier est le vainqueur
    results.first = {
      "ranked" : [],
      "scores" : {}
    };

    var done = _.after(candidatsLabels.length,function(){
      results.first.ranked = _.sortBy(candidatsLabels,(label) => - results.first.scores[label]);
    })
    
    candidatsLabels.forEach(function(label,index){
      var labelVotes = _.filter(votes, (vote) => vote.list[0] == label),
          labelVotes = (labelVotes.length != 0)? labelVotes:[{number:0}];
      
      results.first.scores[label] = _.reduce (
        _.map( labelVotes
          ,(vote)=> vote.number)
        ,(n,m) => n+m);

      done();
    });
    
  })
};


/*------------------- Initialisation -------------------*/

var init = function(){

  db.find({},{number:1},function(err,votes){
    if(err) throw err;
    
    nbVotes = _.reduce(
      _.map(votes,(vote) => vote.number)
      , (n,m) => n+m);
  });
  
  initResults();
}

var show = function(){
  db.find({},function(err,docs){
    console.log(docs);
  })
}

var showResults = function(){
  console.log(results);
}

init();


exports.add         = add;
exports.getFirstRes = getFirstRes;
exports.results     = results;
exports.show        = show;
exports.showResults = showResults;




