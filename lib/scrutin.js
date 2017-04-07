var _ = require('lodash');

/* scrutin majoritaire à 1 tour */
exports.maj1Sct = function(votes){
  return majorityVote(votes,[1]);
}

/* scrutin majoritaire à 2 tours */
exports.maj2Sct = function(votes){
  return majorityVote(votes,[2,1]);
}

/* scrutin par élimination*/
exports.majnSct = function(votes){
  var inv = [];
  
  if (votes.length != 0)
    inv = _.range(votes[0].prefList.length -1,0,-1);
 
  return majorityVote(votes,inv);
}

/* scrutin de Bordas, comptage des points*/
exports.bordasSct = function(votes){
  var score =
      _.reduce(
        _.flatMap(
          votes,
          (vote) => _.map(vote.prefList,
                          (cand,index)=> [cand,(vote.prefList.length - index)*vote.number]))
        ,function(res,pair){
          res[pair[0]] = (res[pair[0]]||0) + pair[1];
          return res;
        },{});

  var ranked = [];
  if(votes.length != 0){
    var sortedCand = _.sortBy(votes[0].prefList,
                              (label)=> - score[label]);

    ranked = _.reduce(sortedCand,
                             (res,cand,index)=> {res[cand] = index +1;
                                                 return res;},
                             {})
  }

  return {
    "ranked": ranked,
    "scores": [score]
  };
};

/* scrutin de Condorcet, comptage des duels gagnés */
exports.condorcetSct = function(votes){
  var tmp = _.flatMap(votes,function(vote){
    var l = vote.prefList;
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
    //si le duel est remporté
    if(!duels[labelInv] || n>duels[labelInv] ){
      res[tmp[0]] = (res[tmp[0]]||0) + 1;
    }else{
      res[tmp[0]] = (res[tmp[0]]||0);
    }
    return res;
  },{})

  var ranked = [];
  if(votes.length != 0){
    var sortedCand = _.sortBy(votes[0].prefList,
                              (label)=> - score[label]);

    ranked = _.reduce(sortedCand,
                             (res,cand,index)=> {res[cand] = index +1;
                                                 return res;},
                             {})
  }

  return {
    "ranked" : ranked,
    "scores" : [score]
  }
}

/* jugMaj détermine le classement à partir de votes de jugement */

exports.jugMaj = function(votes){
 
  var nb = votes.length;
  var sortedMention = ['insuf','passa','quitg','good','veryg'];
  var majMentions = {};
  var majScore = {};
  var cumulScore = {};
  
  var score = _.reduce(votes,function(res,vote){
    _.forEach(vote.candMention,function(mention,label){
      if(res[label]){
	res[label][mention] = (res[label][mention]||0) +1;
	//chaque mention inférieur
	for(var i=0;i<=sortedMention.indexOf(mention);i++){
	  cumulScore[label][sortedMention[i]]=
	    (cumulScore[label][sortedMention[i]]||0)+1;
	}

      }else{
	res[label] = {};
	res[label][mention] = 1;
	cumulScore[label] = {};
	
	for(var i=0;i<=sortedMention.indexOf(mention);i++){
	  cumulScore[label][sortedMention[i]] =1;
	}
      }
    });
    return res;
  },{});

  var majMention = _.mapValues(cumulScore,function(cumulScr,label){
    for(var i = sortedMention.length-1;i>-1;i--){
      var mention = sortedMention[i];
      if(cumulScr[mention]>nb/2){
	majScore[label] = cumulScr[mention];
	return mention;
      }
    }
  })
  
  var sorted = Object.keys(majMention).sort(function(a,b){
    var rankA = sortedMention.indexOf(majMention[a]),
	rankB = sortedMention.indexOf(majMention[b])
    if(rankA == rankB){

      //si ce n'est pas la dernière mention "insuff"
      if(rankA != 0)
	return majScore[b] - majScore[a];
      else{
	return score[a][majMention[a]] - score[b][majMention[b]];
      }
	
    }else{
      return rankB -rankA;
    }
  });

  var ranked = _.mapValues(majMention,function(m,label){
    return sorted.indexOf(label)+1;
  })

  
  return {
    "ranked" : ranked,
    "scores" : [score],
    "cumulScore" : cumulScore,
    "majMention" : majMention,
    "sortedMention" : ['insuf','passa','quitg','good','veryg']
  }
}


/* majTurn sélectionne k vainceurs dans l'ordre à partir de billets de votes
   * avec un scrutin majoritaire (ne considère que les votes en tête de liste)
   * et rend les scores par candidats
   *  arguments :
   * - une liste de vote non vide (comme enregistrés dans la db)
   * - un entier k inférieur au nombre de candidats du vote
   */
var majTurn = function(votes,k){

  //on recupère une liste de candidats
  var candidats = _.clone(votes[0].prefList);
  var zeroPerCand = _.reduce(candidats,
                             (res,cand)=> {res[cand]=0;return res;},
                             {});
  
  var scorePerCand = _.reduce(votes,function(result,vote){

    //on ajoute le nb de vote au 1e candidat de chaque vote
    if(result[vote.prefList[0]])
      result[vote.prefList[0]] += vote.number;
    else
      result[vote.prefList[0]] = vote.number;
    
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
    var oldCand = vote.prefList[0],
        newVoteList = _.intersection(vote.prefList,winners),
        newCand = newVoteList[0],
        newVoteId = newVoteList.join('-'),
        transfert = oldCand+'-'+newCand;
    //nouveau vote
    if(res[0][newVoteId])
      res[0][newVoteId].number += vote.number;
    else
      res[0][newVoteId] = {
        "number" : vote.number,
        "prefList" : newVoteList
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
  
  if(votes.length != 0){
    var sortedCand = _.sortBy(votes[0].prefList,
                              (label)=> - finalScore[label]);

    result.ranked = _.reduce(sortedCand,
                             (res,cand,index)=> {res[cand] = index +1;
                                                 return res;},
                             {})
  }
  
  return result;
};
