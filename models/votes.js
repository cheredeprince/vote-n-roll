var Datastore = require('nedb'),
    db        = new Datastore({ filename: './db/votes', autoload: true }),
    _         = require('lodash');

var candidats = require('./candidats');

var nbVotes   = 0;
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

var getMaj1Res = function(){
  return {
    "flux"   : _.clone(results.maj1.flux),
    "ranked" : _.clone(results.maj1.ranked),
    "scores" : _.clone(results.maj1.scores)
  };
};

var getMaj2Res = function(){
  return {
    "flux"   : _.clone(results.maj2.flux),
    "ranked" : _.clone(results.maj2.ranked),
    "scores" : _.clone(results.maj2.scores)
  };
};

var getMajnRes = function(){
  return {
    "flux"   : _.clone(results.majn.flux),
    "ranked" : _.clone(results.majn.ranked),
    "scores" : _.clone(results.majn.scores)
  };
};
/*------------------- Results -------------------*/

/* Les résultats de chaque scrutin sont stockés 
   dans un objet contenant :
   * - "ranked" une liste des labels de candidats triés par score
   * - "scores" une liste de score telle qu'on ait le score de 
                chaque candidat à chaque tour (scores[tours].candidats)
*/

var results = {
  "maj1": {},
  "maj2": {},
  "majn": {},
  "bordas":{}
};

/*------------------- Results Init -------------------*/


var initResults = function(){

  db.find({},{number:1,list:1},function(err,votes){
    if(err) throw err;
    
    var candidatsLabels = candidats.labels();

    results.maj1 = maj1Sct(votes);
    results.maj2 = maj2Sct(votes);
    results.majn = majnSct(votes);
    results.bordas = bordasSct(votes);
    condorcetSct(votes);

    display();
  });
};



/* mise à jour de la majorité à 1 tour*/
/*
var upMaj1 = function(labelList){
  var candidatsLabels = candidats.labels();

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
    results.maj1 = maj1Sct(votes);
    results.maj2 = maj2Sct(votes);
    results.majn = majnSct(votes);
    results.bordas = bordasSct(votes);
    display();
  });

  next();
};


/* majTurn sélectionne k vainceurs dans l'ordre à partir de billets de votes
   * avec un scrutin majoritaire (ne considère que les votes en tête de liste)
   * et rend les scores par candidats
   *  arguments :
   * - une liste de vote non vide (comme enregistrés dans la db)
   * - un entier k inférieur au nombre de candidats du vote
   */
var majTurn = function(votes,k){
  //on recupère une liste de candidats
  var candidats = _.clone(votes[0].list);
  var zeroPerCand = _.reduce(candidats,
                             (res,cand)=> {res[cand]=0;return res;},
                             {});
  
  var scorePerCand = _.reduce(votes,function(result,vote){
    //on ajoute le nb de vote au 1e candidat de chaque vote
    if(result[vote.list[0]])
      result[vote.list[0]] += vote.number;
    else
      result[vote.list[0]] = vote.number;
    
    return result;
  },{});
  //on initialise les scores à 0 de ceux sans vote
  scorePerCand = _.defaults(scorePerCand,zeroPerCand);
  
  var rankedCand = _.sortBy(candidats,(label)=> - scorePerCand[label]);

  return {
    "ranked" : rankedCand.slice(0,k),
    "scores" : scorePerCand
  };
};


/* simplifyVote simplifie une liste de vote
 * à l'aide d'une liste de vainqueurs
 * en supprimant les candidats perdants des votes
 * renvoye aussi le transfert des points ancien-nouveau
 * args : 
 * - une liste de votes à simplifier à n candidats
 * - une liste de m vainqueurs avec m<n.
 */

var simplifyVote = function(votes,winners){
  //tmp[0] nouveau vote sans les perdants par voteId
  //tmp[1] point transféré par couple ancien-nouveau candidats
  //sans les tranfert nul.
  var tmp = _.reduce(votes,function(res,vote){
    var oldCand = vote.list[0],
        newVoteList = _.intersection(vote.list,winners),
        newCand = newVoteList[0],
        newVoteId = newVoteList.join('-'),
        transfert = oldCand+'-'+newCand;
    //nouveau vote
    if(res[0][newVoteId])
      res[0][newVoteId].number += vote.number;
    else
      res[0][newVoteId] = {
        "number" : vote.number,
        "list" : newVoteList
      };
    //transfert 
    res[1][transfert] = (res[1][transfert]||0) + vote.number;
    
    return res;
  },[{},{}]);

  var voteById  = tmp[0],
      flux = tmp[1];

  return {
    "votes":_.map(voteById,(vote) => vote),
    "flux":flux
  };
}

/* majorityVote rend le score de chaque candidats lors 
 * d'un vote majoritaire pour chacun de ses tours.
 * args : 
 * - liste de vote
 * - une liste non vide strictement décroissante d'entiers
 *   représentant le nombre de vainqueurs à chaque tours
 *   elle se finit donc toujours par 1.
 *   ex : [1] -> vote majoritaire en 1 tour
 *        [2,1] -> vote majoritaire français
 *
 */

var majorityVote = function(votes,nbPerTurn){

  var aux = function(v,npt,scores,flux){
    if(npt.length == 0)
      return {
        "flux":flux.slice(0,flux.length-1),
        "ranked": [],
        "scores": scores
      };
    else{
      var k = npt.shift(),
          majTurnRes = majTurn(v,k),
          simplifyRes = simplifyVote(v,majTurnRes.ranked);
      
      scores.push(majTurnRes.scores);
      flux.push(simplifyRes.flux);
      return aux(simplifyRes.votes,npt,scores,flux);
    }
  };
  
  var result = (votes.length != 0)?
      aux(votes,nbPerTurn,[],[]):
      {
        "flux":  [],
        "ranked":[],
        "scores":[] 
      };

  //on pondère le score par rapport à son tour
  var weightedScore = _.map(result.scores,
                            (score,i) => _.mapValues(score,(v) => Math.pow(10,i)*v));

  var finalScore =
      _.reduce(
        _.flatMap(
          weightedScore,
          (score) => _.toPairs(score)),
        function(res,pair){
          res[pair[0]] = Math.max( (res[pair[0]]||0) ,pair[1]);
          return res;
        },{});
  
  if(votes.length != 0)
    result.ranked = _.sortBy(votes[0].list,
                             (label)=> - finalScore[label]);
  
  return result;
};

/* scrutin majoritaire à 1 tour */
var maj1Sct = function(votes){
  return majorityVote(votes,[1]);
}

/* scrutin majoritaire à 2 tours */
var maj2Sct = function(votes){
  return majorityVote(votes,[2,1]);
}

/* scrutin par élimination*/
var majnSct = function(votes){
  var inv = [];
  
  if (votes.length != 0)
    inv = _.range(votes[0].list.length -1,0,-1);
 
  return majorityVote(votes,inv);
}

/* scrutin de Bordas, comptage des points*/
var bordasSct = function(votes){
  var score =
      _.reduce(
        _.flatMap(
          votes,
          (vote) => _.map(vote.list,
                          (cand,index)=> [cand,(vote.list.length - index)*vote.number]))
        ,function(res,pair){
          res[pair[0]] = (res[pair[0]]||0) + pair[1];
          return res;
        },{});

  var ranked = [];
  if(votes.length != 0)
    ranked = _.sortBy(votes[0].list, (label)=> - score[label]);

  return {
    "ranked": ranked,
    "scores": [score]
  };
};

/* scrutin de Condorcet, comptage des duels gagnés */
var condorcetSct = function(votes){
  var tmp = _.flatMap(votes,function(vote){
    var l = vote.list;
    var prefs = _.flatMap(l,(label,index)=> _.map(l.slice(index+1),(label2)=>[label+'-'+label2,vote.number]))
    return prefs;
  });

  var duels = _.reduce(tmp,function(res,pref){
    res[pref[0]] = (res[pref[0]]||0) + pref[1];
    return res;
  },{});

  var score = _.reduce(duels,function(res,n,d){
    var tmp    = d.split('-'),
        labelInv  = tmp[1]+'-'+tmp[0];
    if(!duels[labelInv] || n>duels[labelInv] ){
      res[tmp[0]] = (res[tmp[0]]||0) + 1;
    }
    return res;
  },{}) 
  console.log(duels);
  console.log(score);
}

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
  console.log('Résultats du vote majoritaire à 1 tour :');
  console.log(results.maj1);
  console.log('Résultats du vote majoritaire à 2 tour :');
    console.log(results.maj2);
  console.log('Résultats du vote majoritaire à n-1 tour :');
    console.log(results.majn);
}

init();


exports.add         = add;
exports.getMaj1Res  = getMaj1Res;
exports.getMaj2Res  = getMaj2Res;
exports.getMajnRes  = getMajnRes;
exports.results     = results;
exports.show        = show;




