var Datastore = require('nedb'),
    db        = new Datastore({ filename: __dirname+'/../db/votes', autoload: true }),
    _         = require('lodash');

var Candidats = require('./candidats'),
    Config    = require('../config'),
    Scrutin   = require('../lib/scrutin');

var nbVotes   = 0;
/*
  * Les votes sont enregistrés ainsi :
  * - une collection qui associe à chaque candidat le rang
  * - un nombre de votes pour cette liste
*/


// incrémente le nombre de vote d'une certaine liste de préférence de label
var add = function(labelList,next){
  var candidatsLabels = Candidats.labels(),
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

// fonctions get pour les résultats

exports.getResults = function(){
  return _.cloneDeep(results)
}

exports.getNbVotes = function(){
  return nbVotes;
}

/*------------------- Results -------------------*/

/* Les résultats de chaque scrutin sont stockés 
   dans un objet contenant :
   * - "ranked" une liste des labels de candidats triés par score
   * - "scores" une liste de score telle qu'on ait le score de 
                chaque candidat à chaque tour (scores[tours].candidats)
*/

var results = {};

/*------------------- Results Init -------------------*/


var initResults = function(){

  db.find({},{number:1,list:1},function(err,votes){
    if(err) throw err;
    
    _.forEach(Config.scrutins,function(scrutin,label){
      results[label] = Scrutin[scrutin.mkRes](votes);
    });
    
//    display();
  });
};



/* mise à jour de la majorité à 1 tour*/
/*
var upMaj1 = function(labelList){
  var candidatsLabels = Candidats.labels();

  var voteLabel = labelList[0],
      first     = results.first;
  
  first.scores[voteLabel] ++;
  first.ranked = _.sortBy(candidatsLabels,(label) => - results.first.scores[label]);
};
*/

var updateResults = function(labelList,next){
  nbVotes++;

  db.find({},{},function(err,votes){
    if(err) throw err;

    _.forEach(Config.scrutins,function(scrutin,label){
      results[label] = Scrutin[scrutin.mkRes](votes);
    })

    display();
  });

  next();
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

var display = function(){
  _.forEach(Config.scrutins,function(scrutin,label){
    console.log(scrutin.name);
    console.log(results[label]);
  })
}

init();

// var c = Candidats.labels(),i=0;
// var after = function(err,v){
//   i++;
//   if(i<1000)
//     add(_.shuffle(c),after);
//   else
//     init();
// };

// after();

exports.add         = add;



