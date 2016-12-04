var _ = require('lodash');

/* chaque bulletin de vote construit un bulletin de vote vide à partir :
   * son nom est le nom du mode du vote
   * son type : voteMode
   * de la liste des candidat : candidats
   * le nom de l'élection : election
   * un label qui définit uniquement les données du vote : label
   * un nombre de fois où il apparaît dans sa boîte de vote
   *
   * la méthode set permet de mettre d'inscrire un vote sur le bulletin
   * la méthode get permet de récupérer le vote pour l'enregistrer dans la bd
   */

/* le bulletins du mode de vote : pref,
   * contiennent en plus :
   * - prefList : la liste de préférence du vote
*/

exports.pref = function(candidats,election){
//  this.election = election;
  this.candidats = candidats;
  this.label = "";
  this.prefList = "";
  this.voteMode = "pref";
  this.number = 0;

  this.set = function(labelList,next){
    var candidatsLabels = this.candidats,
	interLabels = _.intersection(labelList,candidatsLabels);

    //si tous les labels existent et qu'aucun n'est en double
    //et la liste contient tous les candidats.
    if(interLabels.length == candidatsLabels.length
       && labelList.length == candidatsLabels.length){
      //construction du label de vote et inscription du nouveau vote.
      this.label = labelList.join('-');
      this.prefList = labelList;
      next();
    }else{
      next({error:"vote invalide"});
    }
  };

  this.get = function(){
    return {
      "label"    : this.label,
      "voteMode" : this.voteMode,
      "prefList" : this.prefList
    };
  }


}

exports.jug = function(candidats,election){
//  this.election = election;
  this.candidats = candidats;
  this.label = "";
  this.candMention = {};
  this.voteMode = "jug";
  this.number = 0;

  this.set = function(mentionObject,next){
    var candidatsLabels = Object.keys(mentionObject),
	interLabels = _.intersection(this.candidats,candidatsLabels);
    var mentionIn = _.uniq(_.values(mentionObject)),
	mentionAuthorized = ['veryg','good','quitg','passa','insuf'],
	mentionAccepted = _.intersection(mentionIn,mentionAuthorized);

    //si tous les labels existent 
    //et l'objet contient tous les candidats.
    // et si toutes les mentions sont acceptées
    if(interLabels.length == candidatsLabels.length
       && mentionAccepted.length == mentionIn.length){
      //construction du label de vote et inscription du nouveau vote.
      this.label = _.reduceRight(candidatsLabels.sort(),
				 function(string,cand){
				   return string+'-'+cand+'-'+mentionObject[cand];
				 },'').slice(1);
      this.candMention = mentionObject;
      next();
    }else{
      next({error:"vote invalide"});
    }
  };

  this.get = function(){
    return {
      "label"       : this.label,
      "voteMode"    : this.voteMode,
      "candMention" : this.candMention
    };
  }

};
